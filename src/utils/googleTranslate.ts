/**
 * Google Translate website integration helper.
 * Manages the `googtrans` cookie and triggers the Google Translate DOM combo.
 */

export function setGoogleTranslateLanguage(targetLang: "uz" | "ru") {
  if (typeof window === "undefined") return;

  const pair = targetLang === "uz" ? "/auto/uz" : "/auto/ru";
  const explicitPair = targetLang === "uz" ? "/ru/uz" : "/ru/ru";

  // Set cookies for root path and domains
  const host = window.location.hostname;
  const cookieOptions = [
    `googtrans=${pair}; path=/;`,
    `googtrans=${pair}; path=/; domain=${host};`,
    `googtrans=${explicitPair}; path=/;`,
    `googtrans=${explicitPair}; path=/; domain=${host};`,
  ];

  if (host.includes(".")) {
    const rootDomain = host.split(".").slice(-2).join(".");
    cookieOptions.push(`googtrans=${pair}; path=/; domain=.${rootDomain};`);
    cookieOptions.push(`googtrans=${explicitPair}; path=/; domain=.${rootDomain};`);
  }

  cookieOptions.forEach((c) => {
    document.cookie = c;
  });

  // Attempt to select the language from Google Translate select element
  const triggerCombo = () => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      if (combo.value !== targetLang) {
        combo.value = targetLang;
        combo.dispatchEvent(new Event("change"));
      }
      return true;
    }
    return false;
  };

  // Try immediately
  if (!triggerCombo()) {
    // Retry periodically for up to 3 seconds until Google script initializes
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerCombo() || attempts > 15) {
        clearInterval(interval);
      }
    }, 200);
  }
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
