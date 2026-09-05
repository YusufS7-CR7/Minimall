/**
 * Intelligent fuzzy matching and transliteration utility for brand search.
 * Supports typos, phonetic spelling, Russian-to-Latin transliteration,
 * and brand synonyms (e.g. "бош" -> Bosch, "dewolt" -> DeWalt, "филипс" -> Philips).
 */

export function transliterate(str: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return str
    .toLowerCase()
    .split("")
    .map((c) => map[c] || c)
    .join("");
}

export function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

export const BRAND_SYNONYMS: Record<string, string[]> = {
  "Bosch": ["бош", "bosh", "boch", "bosch", "bocsh"],
  "Makita": ["макита", "makita", "makyta", "makit"],
  "DeWalt": ["деволт", "девольт", "девалт", "dewalt", "dewolt", "devalt"],
  "Milwaukee": ["милуоки", "милуоке", "милвоки", "milwaukee", "milwoki", "milwoke"],
  "Metabo": ["метабо", "metabo"],
  "Hilti": ["хилти", "hilti"],
  "Crown": ["краун", "кровн", "crown"],
  "Total": ["тотал", "total"],
  "Ingco": ["ингко", "инко", "ingco"],
  "EPA": ["епа", "эпа", "epa"],
  "Sibrtex": ["сибртех", "сибр", "sibrtex", "sibrtech", "sibrteks", "sibrtx"],
  "Sparta": ["спарта", "sparta", "spart"],
  "MTX": ["мтх", "матрикс", "mtx", "matrix"],
  "Denzel": ["дензел", "дензель", "denzel", "denzl"],
  "Pollwon": ["полвон", "поллвон", "pollwon", "polwon"],
  "Biyoti": ["бийоти", "биоти", "biyoti", "bioti"],
  "Ubay": ["убай", "юбай", "ubay"],
  "Ferro": ["ферро", "феро", "ferro"],
  "SL": ["сл", "sl"],
  "Mexmash": ["мехмаш", "мех", "mexmash", "mehmash"],
  "Epica": ["эпика", "епика", "epica"],
  "PIT": ["пит", "п.и.т", "pit", "p.i.t", "pitt"],
  "Dima": ["дима", "dima"],
  "LIT": ["лит", "lit"],
  "Dingqi": ["дингчи", "дингки", "динги", "dingqi", "dingki"],
  "3M": ["3м", "3m", "три м", "триэм"],
  "Tytan": ["титан", "tytan", "titan"],
  "Selsil": ["селсил", "сельсил", "selsil"],
  "Soudal": ["соудал", "судал", "soudal"],
  "Akfix": ["акфикс", "акфих", "akfix", "akfiks"],
  "Yato": ["ято", "yato"],
  "Yofe": ["йофе", "ёфе", "yofe"],
  "Force": ["форс", "форсе", "force"],
  "Stels": ["стелс", "стельс", "stels"],
  "Luga": ["луга", "лугаабразив", "luga", "lugaabraziv"],
  "Ekspert": ["эксперт", "експерт", "ekspert", "expert"],
  "DDER": ["ддер", "dder"],
  "Varta": ["варта", "varta"],
  "Beshr": ["бешр", "бешер", "beshr"],
  "Philips": ["филипс", "филиппс", "philips", "filips"],
};

export function matchBrandFuzzy(brand: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const b = brand.toLowerCase();

  // 1. Direct or substring match
  if (b.includes(q) || q.includes(b)) return true;

  // 2. Transliterated match
  const qTrans = transliterate(q);
  const bTrans = transliterate(b);
  if (bTrans.includes(qTrans) || qTrans.includes(bTrans)) return true;

  // 3. Known aliases and synonyms
  const synonyms = BRAND_SYNONYMS[brand] || [];
  for (const syn of synonyms) {
    const s = syn.toLowerCase();
    if (s.includes(q) || q.includes(s) || s.includes(qTrans) || qTrans.includes(s)) {
      return true;
    }
    const dist = getLevenshteinDistance(q, s);
    const maxDist = s.length <= 3 ? 1 : s.length <= 6 ? 2 : 3;
    if (dist <= maxDist) return true;
  }

  // 4. Fuzzy Levenshtein on brand name & transliteration
  const distName = getLevenshteinDistance(q, b);
  const distTrans = getLevenshteinDistance(qTrans, bTrans);
  const maxAllowed = b.length <= 3 ? 1 : b.length <= 6 ? 2 : 3;

  return distName <= maxAllowed || distTrans <= maxAllowed;
}
