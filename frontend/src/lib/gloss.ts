/** Helpers for turning machine gloss names into display labels. */

/** "nasi_lemak" -> "NASI LEMAK", "pandai_2" -> "PANDAI". MSL glosses are shown uppercase. */
export function glossLabel(raw: string): string {
  return raw
    .replace(/_(\d+)$/, "") // drop sense-disambiguation suffixes like _2
    .replace(/_/g, " ")
    .trim()
    .toUpperCase();
}

/** Split a stored gloss sentence ("hi apa_khabar") into raw tokens. */
export function glossTokens(glossSentence: string): string[] {
  return glossSentence.split(/\s+/).filter(Boolean);
}
