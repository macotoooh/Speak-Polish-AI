export const WEAKNESS_TAGS = [
  "th",
  "r_l",
  "v_b",
  "stress",
  "rhythm",
  "ending_consonants",
] as const;

export type WeaknessTag = (typeof WEAKNESS_TAGS)[number];

export function isWeaknessTag(value: string): value is WeaknessTag {
  return WEAKNESS_TAGS.includes(value as WeaknessTag);
}

export function normalizeWeaknessTags(value: unknown): WeaknessTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is WeaknessTag =>
      typeof item === "string" && isWeaknessTag(item),
  );
}

export function getWeaknessTagLabel(tag: WeaknessTag): string {
  switch (tag) {
    case "th":
      return '"th" sound';
    case "r_l":
      return '"r" and "l" contrast';
    case "v_b":
      return '"v" and "b" contrast';
    case "stress":
      return "word stress";
    case "rhythm":
      return "sentence rhythm";
    case "ending_consonants":
      return "ending consonants";
    default:
      return tag;
  }
}

export function getWeaknessPrompt(tag: WeaknessTag): string {
  switch (tag) {
    case "th":
      return 'Include several natural words with the "th" sound.';
    case "r_l":
      return 'Include a few natural words that contrast "r" and "l" sounds.';
    case "v_b":
      return 'Include words that help practice the difference between "v" and "b".';
    case "stress":
      return "Use words with clear stressed syllables and natural emphasis.";
    case "rhythm":
      return "Use a sentence with natural spoken rhythm, chunking, and linking.";
    case "ending_consonants":
      return "Include words that end with clear final consonants.";
    default:
      return "Make the sentence suitable for pronunciation practice.";
  }
}

export function getPrimaryWeaknessTag(
  records: Array<{
    pronunciationScore: number;
    weaknessTags?: WeaknessTag[];
  }>,
): WeaknessTag | null {
  const scores = new Map<WeaknessTag, number>();

  for (const record of records.slice(0, 10)) {
    if (!record.weaknessTags || record.weaknessTags.length === 0) {
      continue;
    }

    const weight =
      record.pronunciationScore < 70
        ? 3
        : record.pronunciationScore < 85
          ? 2
          : 1;

    for (const tag of record.weaknessTags) {
      scores.set(tag, (scores.get(tag) ?? 0) + weight);
    }
  }

  let topTag: WeaknessTag | null = null;
  let topScore = 0;

  for (const [tag, score] of scores.entries()) {
    if (score > topScore) {
      topTag = tag;
      topScore = score;
    }
  }

  return topTag;
}
