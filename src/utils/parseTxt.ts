export type ParsedItem = { word: string; meaning: string };

function clean(s: string) {
  return s.replace(/\uFEFF/g, "").trim();
}

export function parseTxt(content: string): ParsedItem[] {
  const lines = content
    .split(/\r?\n/g)
    .map((l) => clean(l))
    .filter(Boolean);

  const out: ParsedItem[] = [];

  for (const line of lines) {
    let idx = line.indexOf(":");
    if (idx === -1) idx = line.indexOf("=");
    if (idx === -1) idx = line.indexOf("-");

    if (idx === -1) continue;

    const left = clean(line.slice(0, idx));
    const right = clean(line.slice(idx + 1));

    if (!left || !right) continue;

    out.push({ word: left, meaning: right });
  }

  return out;
}