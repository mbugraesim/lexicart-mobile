// src/storage/wordsStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ===========================
   H1: Types
=========================== */
export type WordItem = {
  id: string;
  word: string;
  meaning: string;
  createdAt: number;
};

/* ===========================
   H2: Storage Key
=========================== */
const KEY = "LEXIKART_WORDS_V1";

/* ===========================
   H3: Helpers
=========================== */
function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}

export function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* ===========================
   H4: Load / Save
=========================== */
export async function loadWords(): Promise<WordItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];

  const parsed = safeJsonParse<unknown>(raw);
  if (!Array.isArray(parsed)) return [];

  // Basic shape guard (çok katı yapmadım, bozuk kayıtları sessizce eler)
  const cleaned: WordItem[] = [];
  for (const item of parsed as any[]) {
    if (!item) continue;
    const word = typeof item.word === "string" ? item.word : "";
    const meaning = typeof item.meaning === "string" ? item.meaning : "";
    const id = typeof item.id === "string" ? item.id : makeId();
    const createdAt = typeof item.createdAt === "number" ? item.createdAt : Date.now();

    if (!word.trim()) continue;

    cleaned.push({
      id,
      word: word.trim(),
      meaning: meaning.trim(),
      createdAt,
    });
  }

  // createdAt’e göre sırala (eski → yeni)
  cleaned.sort((a, b) => a.createdAt - b.createdAt);
  return cleaned;
}

export async function saveWords(words: WordItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
}

/* ===========================
   H5: Merge + Dedupe
   - dupe varsa mevcut kaydı korur (meaning güncellemez)
=========================== */
export function mergeDedupe(
  existing: WordItem[],
  incoming: { word: string; meaning: string }[]
) {
  const map = new Map<string, WordItem>();

  // önce mevcutları ekle
  for (const w of existing) {
    const key = normalizeWord(w.word);
    if (!key) continue;
    map.set(key, {
      ...w,
      word: w.word.trim(),
      meaning: (w.meaning ?? "").trim(),
    });
  }

  let added = 0;

  // gelenleri ekle (dupe varsa dokunma)
  for (const it of incoming) {
    const key = normalizeWord(it.word);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        id: makeId(),
        word: it.word.trim(),
        meaning: (it.meaning ?? "").trim(),
        createdAt: Date.now(),
      });
      added++;
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
  return { merged, added };
}