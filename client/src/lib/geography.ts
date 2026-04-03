/**
 * Guinea geography helper utilities for marketplace/location filters.
 * Prefecture list source: Wikipedia "Prefectures of Guinea" (33) + Conakry special zone.
 */
export const PREFECTURES = [
  "Conakry",
  "Beyla", "Boffa", "Boké", "Coyah", "Dabola", "Dalaba", "Dinguiraye",
  "Dubréka", "Faranah", "Forécariah", "Fria", "Gaoual", "Guéckédou",
  "Kankan", "Kérouané", "Kindia", "Kissidougou", "Koubia", "Koundara",
  "Kouroussa", "Labé", "Lélouma", "Lola", "Macenta", "Mali", "Mamou",
  "Mandiana", "Nzérékoré", "Pita", "Siguiri", "Télimélé", "Tougué",
];

export type GuineaSubPrefecture = {
  name: string;
  prefecture: string;
  hasc?: string;
};

const STATOIDS_URL = "https://statoids.com/ygn.html";

/**
 * Try to load the ~365 sub-prefectures list at runtime.
 * Source: Statoids list of Guinea subprefectures.
 */
export async function fetchSubPrefectures(): Promise<GuineaSubPrefecture[]> {
  try {
    const res = await fetch(STATOIDS_URL);
    const html = await res.text();

    // Crude parse: Statoids table: <tr><td>Subprefecture</td><td>HASC</td><td>Prefecture</td>...
    const rows = html.split("<tr");
    const entries: GuineaSubPrefecture[] = [];
    for (const row of rows) {
      const tds = row.split("</td>");
      if (tds.length < 4) continue;
      const nameRaw = stripTags(tds[1] ?? "");
      const hascRaw = stripTags(tds[2] ?? "");
      const prefectureRaw = stripTags(tds[3] ?? "");

      const name = nameRaw.trim();
      const prefecture = prefectureRaw.trim();
      const hasc = hascRaw.trim();
      if (!name || !prefecture || name.toLowerCase() === "subprefecture") continue;

      entries.push({ name, prefecture, hasc });
    }

    // Remove obvious noise/duplicates
    return entries.filter((e) => !!e.name && !!e.prefecture);
  } catch (e) {
    console.warn("Could not load sub-prefectures", e);
    return [];
  }
}

function stripTags(s: string) {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}
