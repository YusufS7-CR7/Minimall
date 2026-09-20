Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $projectRoot "public\logo.jpg"
$publicDir = Join-Path $projectRoot "public"

Write-Output "Loading logo from $logoPath..."
$src = [System.Drawing.Image]::FromFile($logoPath)

function Resize-Bitmap($source, [int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($source, 0, 0, $w, $h)
    $g.Dispose()
    return $bmp
}

# 1. Generate PNGs:
# 32x32, 48x48, 96x96, 180x180 (apple-touch-icon), 192x192 (PWA), 512x512 (PWA / Google high-res)
$pngSizes = @{
    "favicon-32.png" = 32
    "favicon-48.png" = 48
    "favicon-96.png" = 96
    "favicon.png" = 96
    "apple-touch-icon.png" = 180
    "android-chrome-192x192.png" = 192
    "android-chrome-512x512.png" = 512
}

foreach ($entry in $pngSizes.GetEnumerator()) {
    $targetFile = Join-Path $publicDir $entry.Key
    $sz = $entry.Value
    $bmp = Resize-Bitmap $src $sz $sz
    $bmp.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Created: $targetFile ($sz x $sz)"
}

# 2. Generate multi-resolution valid favicon.ico:
# We will create an ICO file containing 16x16, 32x32, 48x48 PNG frames
$icoSizes = @(16, 32, 48)
$frameBytes = @()
$frameHeaders = @()

foreach ($s in $icoSizes) {
    $bmp = Resize-Bitmap $src $s $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $bytes = $ms.ToArray()
    $ms.Dispose()
    $frameBytes += ,$bytes
}

# Calculate offsets
$icoHeaderSize = 6
$dirEntrySize = 16
$totalEntries = $icoSizes.Count
$currentOffset = $icoHeaderSize + ($dirEntrySize * $totalEntries)

$outMs = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($outMs)

# Write ICONDIR
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type 1 = ICO
$bw.Write([uint16]$totalEntries) # Count

for ($i = 0; $i -lt $totalEntries; $i++) {
    $s = $icoSizes[$i]
    $data = $frameBytes[$i]
    $dataLen = $data.Length

    # Width and Height (byte: 0 for 256)
    $wByte = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $hByte = if ($s -ge 256) { [byte]0 } else { [byte]$s }

    $bw.Write($wByte) # Width
    $bw.Write($hByte) # Height
    $bw.Write([byte]0) # Color count
    $bw.Write([byte]0) # Reserved
    $bw.Write([uint16]1) # Color planes
    $bw.Write([uint16]32) # Bits per pixel
    $bw.Write([uint32]$dataLen) # Bytes in resource
    $bw.Write([uint32]$currentOffset) # Offset of image data

    $currentOffset += $dataLen
}

# Write image data
for ($i = 0; $i -lt $totalEntries; $i++) {
    $bw.Write($frameBytes[$i])
}

$bw.Flush()
$icoBytes = $outMs.ToArray()
$bw.Dispose()
$outMs.Dispose()

$icoPath = Join-Path $publicDir "favicon.ico"
[System.IO.File]::WriteAllBytes($icoPath, $icoBytes)
Write-Output "Created valid multi-resolution ICO: $icoPath (Sizes: 16x16, 32x32, 48x48)"

$src.Dispose()
Write-Output "All icons successfully generated!"
