// src/utils/parseTxt.ts

/* ============================================================
   H1: Parsed Tip
============================================================ */
export type ParsedItem = { word: string; meaning: string };

/* ============================================================
   H2: Temizleme Fonksiyonu
   - BOM temizler
   - Fazla boşlukları sadeleştirir
============================================================ */
function clean(s: string) {
  return s
    .replace(/\uFEFF/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================
   H3: Satırdan Ayraç Bulma
   - :, =, -, ; destekler
   - İlk bulunanı alır
============================================================ */
function findSeparator(line: string) {
  const separators = [":", "=", "-", ";"];
  for (const sep of separators) {
    const idx = line.indexOf(sep);
    if (idx !== -1) return { idx, sep };
  }
  return null;
}

/* ============================================================
   H4: Ana Parser
   - Tüm satır sonu tiplerini destekler
   - Boş satırları atar
   - Hatalı satırları pas geçer
   - Tekrarlı kelimeleri sonuncuyla günceller
============================================================ */
export function parseTxt(content: string): ParsedItem[] {
  if (!content) return [];

  // 🔥 TÜM newline tiplerini destekler
  const lines = content
    .split(/\r\n|\n|\r/g)
    .map((l) => clean(l))
    .filter(Boolean);

  const map = new Map<string, ParsedItem>();

  for (const rawLine of lines) {
    const line = clean(rawLine);
    if (!line) continue;

    const found = findSeparator(line);
    if (!found) continue;

    const left = clean(line.slice(0, found.idx));
    const right = clean(line.slice(found.idx + 1));

    if (!left || !right) continue;

    const key = left.toLowerCase();

    map.set(key, {
      word: left,
      meaning: right,
    });
  }

  /* ============================================================
     H5: Alfabetik Sıralama
  ============================================================ */
  return Array.from(map.values()).sort((a, b) =>
    a.word.localeCompare(b.word)
  );
}