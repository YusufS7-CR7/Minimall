import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, "..", "public", "logo.jpg");
const buffer = fs.readFileSync(logoPath);
const base64 = buffer.toString("base64");
const outContent = `// Auto-generated inlined logo asset (zero-network dependency)
export const LOGO_DATA_URI = "data:image/jpeg;base64,${base64}";
export default LOGO_DATA_URI;
`;

const outPath = path.join(__dirname, "..", "src", "assets", "logoDataUri.ts");
fs.writeFileSync(outPath, outContent, "utf-8");
console.log("Generated src/assets/logoDataUri.ts successfully, length:", outContent.length);
