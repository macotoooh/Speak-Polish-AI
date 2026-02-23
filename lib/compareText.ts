export function calculateAccuracy(original: string, spoken: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .split(" ");

  const originalWords = normalize(original);
  const spokenWords = normalize(spoken);

  let matchCount = 0;

  originalWords.forEach((word, i) => {
    if (spokenWords[i] === word) {
      matchCount++;
    }
  });

  return Math.round((matchCount / originalWords.length) * 100);
}
