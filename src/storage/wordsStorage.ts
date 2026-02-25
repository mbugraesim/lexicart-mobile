import AsyncStorage from "@react-native-async-storage/async-storage";

export type WordItem = {
  id: string;
  word: string;
  meaning: string;
  createdAt: number;
};

const KEY = "LEXIKART_WORDS_V1";

export async function loadWords(): Promise<WordItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export async function saveWords(words: WordItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
}

export function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function mergeDedupe(existing: WordItem[], incoming: { word: string; meaning: string }[]) {
  const map = new Map<string, WordItem>();

  // önce mevcutları ekle
  for (const w of existing) {
    map.set(w.word.trim().toLowerCase(), w);
  }

  let added = 0;

  // gelenleri ekle (dupe varsa anlamı güncelleme yapma; istersen yaparız)
  for (const it of incoming) {
    const key = it.word.trim().toLowerCase();
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        id: makeId(),
        word: it.word.trim(),
        meaning: it.meaning.trim(),
        createdAt: Date.now(),
      });
      added++;
    }
  }

  // createdAt’e göre sırala
  const merged = Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);

  return { merged, added };
}