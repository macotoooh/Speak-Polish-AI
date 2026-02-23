export type PronunciationIssue = {
  expected: string;
  heard: string;
  advice: string;
};

export type PronunciationFeedback = {
  overallScore: number;
  aiTimingScore: number | null;
  targetMatchScore: number | null;
  englishConfidence: number | null;
  isTargetSentence: boolean;
  summary: string;
  consonantComment: string;
  vowelComment: string;
  stressComment: string;
  pronunciationIssues: PronunciationIssue[];
  practiceTips: string[];
  targetText: string;
  transcribedText: string;
  analysisMode: "audio_transcription_timing";
};
