/**
 * Google Translate cleanup helper.
 * Ensures legacy `googtrans` cookies and DOM artifacts are cleared.
 */

export function clearGoogleTranslateCookies() {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const past = "Thu, 01 Jan 1970 00:00:00 UTC";
  const clearList = [
    `googtrans=; expires=${past}; path=/;`,
    `googtrans=; expires=${past}; path=/; domain=${host};`,
  ];

  if (host.includes(".")) {
    const rootDomain = host.split(".").slice(-2).join(".");
    clearList.push(`googtrans=; expires=${past}; path=/; domain=.${rootDomain};`);
  }

  clearList.forEach((c) => {
    document.cookie = c;
  });
}

/** Kept for backwards compatibility if called */
export function setGoogleTranslateLanguage(_targetLang?: "uz" | "ru") {
  clearGoogleTranslateCookies();
}

/**
 * Translate a piece of text using Google Translate's free unofficial endpoint.
 * Uses the same API that the Google Translate website uses (no key required).
 * @param text - Source text (Russian)
 * @param from - Source language code, default "ru"
 * @param to - Target language code, default "uz"
 */
export async function translateText(
  text: string,
  from = "ru",
  to = "uz"
): Promise<string> {
  if (!text.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Translation request failed");
    const data = await res.json();
    // Response shape: [[["translated", "original", ...],...], ...]
    const translated: string = data[0]
      .map((item: [string]) => item[0])
      .join("");
    return translated;
  } catch {
    // Silently return empty on error so caller can show a user-friendly fallback
    return "";
  }
}
