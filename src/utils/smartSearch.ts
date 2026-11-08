/**
 * Smart Search Utility for Mini-Mall
 * 
 * Capabilities:
 * 1. Keyboard Layout Switching (QWERTY <-> ЙЦУКЕН, e.g. "kfkfre" <-> "лалаку")
 * 2. Transliteration (Cyrillic <-> Latin, e.g. "лалаку" <-> "lalaku", "макита" <-> "makita")
 * 3. Typo Tolerance & Fuzzy Matching (Levenshtein distance & phonetics: "балгарка" -> "болгарка")
 * 4. Word Stemming & Endings Trimming (Russian/Uzbek plurals and cases: "диски" -> "диск")
 * 5. Brand Synonyms ("бош" -> "Bosch", "деволт" -> "DeWalt")
 * 6. Multi-word Tokenization and Relevance Scoring
 */

import type { Product } from "@/data/types";
import { BRAND_SYNONYMS } from "./brandSearch";

// ─── 1. Keyboard Layout Conversion ──────────────────────────────────────────

const EN_TO_RU_MAP: Record<string, string> = {
  q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з",
  "[": "х", "]": "ъ", "{": "Х", "}": "Ъ",
  a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о", k: "л", l: "д",
  ";": "ж", "'": "э", ":": "Ж", "\"": "Э",
  z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т", m: "ь",
  ",": "б", ".": "ю", "<": "Б", ">": "Ю",
  "`": "ё", "~": "Ё",
};

const RU_TO_EN_MAP: Record<string, string> = {};
for (const [en, ru] of Object.entries(EN_TO_RU_MAP)) {
  RU_TO_EN_MAP[ru.toLowerCase()] = en.toLowerCase();
}

/** Switch EN -> RU keyboard layout (e.g. "kfkfre" -> "лалаку") */
export function switchEnToRu(text: string): string {
  return text
    .split("")
    .map((c) => EN_TO_RU_MAP[c] || EN_TO_RU_MAP[c.toLowerCase()] || c)
    .join("");
}

/** Switch RU -> EN keyboard layout (e.g. "дфдфлг" -> "lalaku") */
export function switchRuToEn(text: string): string {
  return text
    .split("")
    .map((c) => RU_TO_EN_MAP[c] || RU_TO_EN_MAP[c.toLowerCase()] || c)
    .join("");
}

// ─── 2. Bidirectional Transliteration ───────────────────────────────────────

const CYR_TO_LAT_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o'", ғ: "g'", қ: "q", ҳ: "h",
};

/** Cyrillic -> Latin (e.g. "лалаку" -> "lalaku", "перфоратор" -> "perforator") */
export function cyrillicToLatin(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => CYR_TO_LAT_MAP[c] ?? c)
    .join("");
}

/** Latin -> Cyrillic (e.g. "lalaku" -> "лалаку", "makita" -> "макита") */
export function latinToCyrillic(text: string): string {
  let str = text.toLowerCase();

  // Multi-letter combinations first
  const multiMap: Array<[RegExp, string]> = [
    [/sch/g, "щ"],
    [/sh/g, "ш"],
    [/ch/g, "ч"],
    [/zh/g, "ж"],
    [/yo/g, "ё"],
    [/yu/g, "ю"],
    [/ya/g, "я"],
    [/ts/g, "ц"],
    [/kh/g, "х"],
    [/ck/g, "к"],
    [/ph/g, "ф"],
    [/th/g, "т"],
    [/ee/g, "и"],
    [/oo/g, "у"],
    [/o['`‘’]/g, "ў"],
    [/g['`‘’]/g, "ғ"],
  ];

  for (const [regex, rep] of multiMap) {
    str = str.replace(regex, rep);
  }

  const singleMap: Record<string, string> = {
    a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г",
    h: "х", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н",
    o: "о", p: "п", q: "к", r: "р", s: "с", t: "т", u: "у",
    v: "в", w: "в", x: "кс", y: "й", z: "з",
  };

  return str
    .split("")
    .map((c) => singleMap[c] ?? c)
    .join("");
}

// ─── 3. Levenshtein Distance (Typo detection) ───────────────────────────────

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  // Fast path for small edits
  const aLen = a.length;
  const bLen = b.length;

  if (Math.abs(aLen - bLen) > 3) return 999;

  let row = Array.from({ length: bLen + 1 }, (_, i) => i);
  for (let i = 1; i <= aLen; i++) {
    const newRow = [i];
    const aChar = a[i - 1];
    for (let j = 1; j <= bLen; j++) {
      const cost = aChar === b[j - 1] ? 0 : 1;
      newRow[j] = Math.min(
        newRow[j - 1] + 1,      // insertion
        row[j] + 1,             // deletion
        row[j - 1] + cost       // substitution
      );
    }
    row = newRow;
  }
  return row[bLen];
}

// ─── 4. Stemming / Russian Ending Stripping ──────────────────────────────────

/** Strip common Russian & Uzbek word endings to match root words */
export function stemWord(word: string): string {
  if (word.length <= 3) return word;
  return word
    // Russian case endings and plurals
    .replace(/(ыми|ими|ых|их|ого|его|ому|ему|ов|ев|ей|ам|ям|ами|ями|ах|ях|ую|юю|ое|ее|ие|ые|ый|ий|ой|ей|а|я|о|е|у|ю|ы|и|ь)$/i, "")
    // Uzbek plural & case suffixes
    .replace(/(lar|ning|dan|ga|da|ni)$/i, "");
}

/** Phonetic normalization (treat 'а'/'о', 'и'/'е', single/double letters similarly) */
export function normalizePhonetics(word: string): string {
  return word
    .toLowerCase()
    .replace(/о/g, "а")
    .replace(/и/g, "е")
    .replace(/щ/g, "ш")
    .replace(/д/g, "т")
    .replace(/з/g, "с")
    .replace(/б/g, "п")
    .replace(/в/g, "ф")
    .replace(/(.)\1+/g, "$1"); // collapse double letters: "лаллаку" -> "лалаку"
}

// ─── 5. Query Variants Generator ────────────────────────────────────────────

export interface QueryVariants {
  original: string;
  tokens: string[];
  switchedRu: string;
  switchedEn: string;
  translitLat: string;
  translitCyr: string;
  expandedTokens: Set<string>;
}

export function buildQueryVariants(query: string): QueryVariants {
  const original = query.trim().toLowerCase();
  const rawTokens = original.split(/[\s,._\-/+]+/).filter((t) => t.length > 0);

  const switchedRu = switchEnToRu(original);
  const switchedEn = switchRuToEn(original);
  const translitLat = cyrillicToLatin(original);
  const translitCyr = latinToCyrillic(original);

  const expandedTokens = new Set<string>();

  for (const token of rawTokens) {
    expandedTokens.add(token);
    expandedTokens.add(stemWord(token));
    expandedTokens.add(normalizePhonetics(token));

    // Keyboard switched
    const sRu = switchEnToRu(token);
    if (sRu !== token) {
      expandedTokens.add(sRu);
      expandedTokens.add(stemWord(sRu));
    }
    const sEn = switchRuToEn(token);
    if (sEn !== token) {
      expandedTokens.add(sEn);
      expandedTokens.add(stemWord(sEn));
    }

    // Transliteration
    const tLat = cyrillicToLatin(token);
    if (tLat !== token) {
      expandedTokens.add(tLat);
      expandedTokens.add(stemWord(tLat));
    }
    const tCyr = latinToCyrillic(token);
    if (tCyr !== token) {
      expandedTokens.add(tCyr);
      expandedTokens.add(stemWord(tCyr));
    }

    // Check brand synonyms (e.g. "бош" -> Bosch, "макита" -> Makita)
    for (const [brandName, syns] of Object.entries(BRAND_SYNONYMS)) {
      if (syns.includes(token) || syns.includes(tLat) || syns.includes(tCyr)) {
        expandedTokens.add(brandName.toLowerCase());
        expandedTokens.add(brandName.toLowerCase().replace(/\s+/g, ""));
      }
    }
  }

  return {
    original,
    tokens: rawTokens,
    switchedRu,
    switchedEn,
    translitLat,
    translitCyr,
    expandedTokens,
  };
}

// ─── 6. Matching & Scoring Logic ────────────────────────────────────────────

/**
 * Checks if a search token matches a target word with fuzzy tolerance
 */
function matchTokenToWord(token: string, word: string): { matched: boolean; score: number } {
  if (!token || !word) return { matched: false, score: 0 };
  if (token === word) return { matched: true, score: 100 };
  if (word.startsWith(token)) return { matched: true, score: 85 };
  if (word.includes(token)) return { matched: true, score: 65 };

  // Stem match
  const tokenStem = stemWord(token);
  const wordStem = stemWord(word);
  if (tokenStem.length >= 3 && wordStem.length >= 3) {
    if (tokenStem === wordStem) return { matched: true, score: 80 };
    if (wordStem.startsWith(tokenStem)) return { matched: true, score: 70 };
    if (tokenStem.startsWith(wordStem)) return { matched: true, score: 65 };
  }

  // Phonetic match
  const pToken = normalizePhonetics(token);
  const pWord = normalizePhonetics(word);
  if (pToken === pWord) return { matched: true, score: 75 };
  if (pWord.startsWith(pToken)) return { matched: true, score: 60 };

  // Levenshtein distance for typos
  const maxAllowedDist = token.length <= 3 ? 0 : token.length <= 5 ? 1 : token.length <= 8 ? 2 : 3;
  if (maxAllowedDist > 0) {
    const dist = levenshteinDistance(token, word);
    if (dist <= maxAllowedDist) {
      return { matched: true, score: Math.max(30, 80 - dist * 25) };
    }
    // Also check distance between phonetically normalized words
    const distPhonetic = levenshteinDistance(pToken, pWord);
    if (distPhonetic <= maxAllowedDist) {
      return { matched: true, score: Math.max(25, 70 - distPhonetic * 25) };
    }
  }

  return { matched: false, score: 0 };
}

/**
 * Calculate relevance score for a single product given the query variants
 */
export function scoreProduct(product: Product, variants: QueryVariants, lang: "ru" | "uz"): number {
  const { original, tokens, switchedRu, switchedEn, translitLat, translitCyr } = variants;
  if (!original) return 0;

  const nameRu = (product.name || "").toLowerCase();
  const nameUz = (product.nameUz || "").toLowerCase();
  const primaryName = lang === "uz" ? (nameUz || nameRu) : nameRu;
  const brand = (product.brand || "").toLowerCase();
  const brandSynonyms = BRAND_SYNONYMS[product.brand] || [];
  const slug = (product.slug || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  // 1. Direct whole-string match (Highest priority)
  if (primaryName === original || brand === original) return 1000;
  if (primaryName.startsWith(original)) return 850;
  if (primaryName.includes(original)) return 700;

  // 2. Transliteration / Keyboard whole-string match
  const wholeVariants = [switchedRu, switchedEn, translitLat, translitCyr].filter((v) => v && v !== original);
  for (const v of wholeVariants) {
    if (primaryName.includes(v) || brand.includes(v)) {
      return 650;
    }
  }

  // Also check if primaryName transliterated matches query
  const nameLat = cyrillicToLatin(primaryName);
  const nameCyr = latinToCyrillic(primaryName);
  if (nameLat.includes(original) || nameCyr.includes(original) || nameLat.includes(translitLat)) {
    return 600;
  }

  // 3. Token-by-token scoring
  // Tokenize product searchable fields
  const productWords = [
    ...primaryName.split(/[\s,._\-/+]+/),
    ...nameRu.split(/[\s,._\-/+]+/),
    ...nameUz.split(/[\s,._\-/+]+/),
    brand,
    ...brandSynonyms,
    category,
    ...slug.split(/[-_]+/),
  ].map((w) => w.toLowerCase().trim()).filter(Boolean);

  // Add transliterated words of product as well
  const expandedProductWords = new Set<string>();
  for (const w of productWords) {
    expandedProductWords.add(w);
    expandedProductWords.add(cyrillicToLatin(w));
    expandedProductWords.add(latinToCyrillic(w));
  }
  const allProductWordsList = Array.from(expandedProductWords);

  let totalTokenScore = 0;
  let matchedTokensCount = 0;

  for (const token of tokens) {
    let bestTokenScore = 0;

    // Direct token variants to test: token, switched, transliterated
    const tokenCandidates = [
      token,
      switchEnToRu(token),
      switchRuToEn(token),
      cyrillicToLatin(token),
      latinToCyrillic(token),
    ];

    for (const prodWord of allProductWordsList) {
      for (const cand of tokenCandidates) {
        const { matched, score } = matchTokenToWord(cand, prodWord);
        if (matched && score > bestTokenScore) {
          bestTokenScore = score;
        }
      }
    }

    if (bestTokenScore > 0) {
      matchedTokensCount++;
      totalTokenScore += bestTokenScore;
    }
  }

  // Require at least partial match
  if (tokens.length > 0 && matchedTokensCount === 0) {
    return 0;
  }

  // Bonus when ALL query tokens matched
  const allTokensMatchedBonus = matchedTokensCount === tokens.length ? 250 : 0;
  
  // Brand bonus if brand matched
  const brandMatchBonus = brand && variants.expandedTokens.has(brand) ? 120 : 0;

  // In-stock products get a gentle boost
  const stockBonus = product.inStock ? 15 : 0;

  return totalTokenScore + allTokensMatchedBonus + brandMatchBonus + stockBonus;
}

// ─── 7. Main Search Function ────────────────────────────────────────────────

export interface SearchResultItem {
  product: Product;
  score: number;
}

/**
 * Searches and ranks products using smart typo-tolerant, layout-tolerant,
 * and transliteration-tolerant algorithms.
 */
export function searchProducts(
  products: Product[],
  query: string,
  lang: "ru" | "uz" = "ru"
): Product[] {
  if (!query || !query.trim()) return [];

  const variants = buildQueryVariants(query);
  const scoredItems: SearchResultItem[] = [];

  for (const product of products) {
    const score = scoreProduct(product, variants, lang);
    if (score > 0) {
      scoredItems.push({ product, score });
    }
  }

  // Sort by relevance score descending
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((item) => item.product);
}
