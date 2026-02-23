import { NextResponse } from "next/server";
import type { PronunciationFeedback } from "@/types/pronunciation";

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type TranscriptionWord = {
  word: string;
  start: number;
  end: number;
};

type TranscriptionResponse = {
  text?: string;
  words?: TranscriptionWord[];
};

type TranscriptionAttempt = {
  model: string;
  responseFormat?: "verbose_json" | "json";
  includeWordTimestamps: boolean;
};

const fallbackFeedback: PronunciationFeedback = {
  overallScore: 0,
  aiTimingScore: null,
  targetMatchScore: null,
  englishConfidence: null,
  isTargetSentence: false,
  summary: "Feedback is not available.",
  consonantComment: "No analysis.",
  vowelComment: "No analysis.",
  stressComment: "No analysis.",
  pronunciationIssues: [],
  practiceTips: [],
  targetText: "",
  transcribedText: "",
  analysisMode: "audio_transcription_timing",
};

function stripCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function normalizeAiTimingScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = value > 0 && value <= 10 ? value * 10 : value;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeOverallScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = value > 0 && value <= 10 ? value * 10 : value;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizePercentScore(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = value > 0 && value <= 10 ? value * 10 : value;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeFeedback(
  input: Partial<PronunciationFeedback>,
  targetText: string,
  transcribedText: string,
): PronunciationFeedback {
  const aiTimingScore = normalizeAiTimingScore(input.aiTimingScore);
  const aiOverallScore = normalizeOverallScore(input.overallScore);
  const targetMatchScore = normalizePercentScore(input.targetMatchScore);
  const englishConfidence = normalizePercentScore(input.englishConfidence);
  const isTargetSentence = input.isTargetSentence === true;

  const scoreWithMatchCap =
    aiOverallScore === null
      ? 0
      : targetMatchScore === null
        ? aiOverallScore
        : Math.min(aiOverallScore, targetMatchScore);

  const scoreWithGuard =
    isTargetSentence && (englishConfidence === null || englishConfidence >= 50)
      ? scoreWithMatchCap
      : Math.min(scoreWithMatchCap, 20);
  const score = Math.max(0, Math.min(100, Math.round(scoreWithGuard)));

  const issues = Array.isArray(input.pronunciationIssues)
    ? input.pronunciationIssues
        .filter(
          (issue) =>
            issue &&
            typeof issue.expected === "string" &&
            typeof issue.heard === "string" &&
            typeof issue.advice === "string",
        )
        .slice(0, 5)
    : [];

  const tips = Array.isArray(input.practiceTips)
    ? input.practiceTips.filter((tip) => typeof tip === "string").slice(0, 5)
    : [];

  return {
    overallScore: score,
    aiTimingScore,
    targetMatchScore,
    englishConfidence,
    isTargetSentence,
    summary:
      typeof input.summary === "string" && input.summary.trim().length > 0
        ? input.summary.trim()
        : "Feedback is not available.",
    consonantComment:
      typeof input.consonantComment === "string" &&
      input.consonantComment.trim().length > 0
        ? input.consonantComment.trim()
        : "No consonant-specific feedback.",
    vowelComment:
      typeof input.vowelComment === "string" &&
      input.vowelComment.trim().length > 0
        ? input.vowelComment.trim()
        : "No vowel-specific feedback.",
    stressComment:
      typeof input.stressComment === "string" &&
      input.stressComment.trim().length > 0
        ? input.stressComment.trim()
        : "No stress-specific feedback.",
    pronunciationIssues: issues,
    practiceTips: tips,
    targetText,
    transcribedText,
    analysisMode: "audio_transcription_timing",
  };
}

async function transcribeAudio(audioFile: File, apiKey: string) {
  const preferredModel =
    process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";
  const attempts: TranscriptionAttempt[] = [
    {
      model: preferredModel,
      responseFormat: "verbose_json",
      includeWordTimestamps: true,
    },
    {
      model: preferredModel,
      responseFormat: "json",
      includeWordTimestamps: false,
    },
    {
      model: "whisper-1",
      responseFormat: "verbose_json",
      includeWordTimestamps: true,
    },
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    const transcriptionForm = new FormData();
    transcriptionForm.append(
      "file",
      audioFile,
      audioFile.name || "recording.webm",
    );
    transcriptionForm.append("model", attempt.model);
    transcriptionForm.append("language", "en");

    if (attempt.responseFormat) {
      transcriptionForm.append("response_format", attempt.responseFormat);
    }

    if (attempt.includeWordTimestamps) {
      transcriptionForm.append("timestamp_granularities[]", "word");
    }

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: transcriptionForm,
      },
    );

    if (response.ok) {
      return (await response.json()) as TranscriptionResponse;
    }

    const errorText = await response.text();
    errors.push(
      `[model=${attempt.model}, format=${attempt.responseFormat ?? "default"}] ${errorText}`,
    );
  }

  throw new Error(`Transcription failed. ${errors.join(" | ")}`);
}

async function generateFeedback(
  targetText: string,
  audioFile: File,
  apiKey: string,
) {
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
  const audioBase64 = audioBuffer.toString("base64");
  const fileType = audioFile.type.toLowerCase();
  const audioFormat = fileType.includes("wav")
    ? "wav"
    : fileType.includes("mp3") || fileType.includes("mpeg")
      ? "mp3"
      : fileType.includes("m4a") || fileType.includes("mp4")
        ? "m4a"
        : "webm";

  const systemPrompt =
    "You are an English pronunciation coach. Analyze pronunciation directly from the provided audio against the target sentence. Always return valid JSON and provide distinct comments for consonants, vowels, and stress. Never give high scores to unrelated or non-English speech.";
  const userPrompt = `
Target sentence:
${targetText}

Evaluate the learner's pronunciation directly from the input audio.
Return a best-effort transcription in "transcribedText".
Strict scoring rules:
- If the utterance is not the target sentence, set isTargetSentence=false and overallScore <= 20.
- If speech is non-English or gibberish, set englishConfidence < 50 and overallScore <= 20.
- Do not return 100 unless target sentence match and pronunciation quality are both excellent.

Return strict JSON with this schema:
{
  "overallScore": number, // 0-100 final pronunciation score
  "aiTimingScore": number, // 0-100 from timing/rhythm only (pauses, tempo, flow)
  "targetMatchScore": number, // 0-100 semantic/content match to target sentence
  "englishConfidence": number, // 0-100 confidence that utterance is meaningful English
  "isTargetSentence": boolean,
  "transcribedText": string,
  "summary": string,
  "consonantComment": string,
  "vowelComment": string,
  "stressComment": string,
  "pronunciationIssues": [
    { "expected": string, "heard": string, "advice": string }
  ],
  "practiceTips": string[]
}
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_AUDIO_ANALYSIS_MODEL ?? "gpt-4o-audio-preview",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "input_audio",
              input_audio: {
                data: audioBase64,
                format: audioFormat,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Feedback generation failed: ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionsResponse;
  return data.choices?.[0]?.message?.content;
}

async function generateFeedbackFromTranscript(
  targetText: string,
  transcribedText: string,
  words: TranscriptionWord[],
  apiKey: string,
) {
  const systemPrompt =
    "You are an English pronunciation coach. Analyze likely pronunciation issues using transcript differences and word timings. Always provide distinct comments for consonants, vowels, and stress. Never give high scores to unrelated or non-English speech.";
  const userPrompt = `
Target sentence:
${targetText}

Learner transcription:
${transcribedText}

Word timings from learner audio (seconds):
${JSON.stringify(words.slice(0, 80))}

Strict scoring rules:
- If the utterance is not the target sentence, set isTargetSentence=false and overallScore <= 20.
- If speech is non-English or gibberish, set englishConfidence < 50 and overallScore <= 20.
- Do not return 100 unless target sentence match and pronunciation quality are both excellent.

Return strict JSON with this schema:
{
  "overallScore": number, // 0-100 final pronunciation score
  "aiTimingScore": number, // 0-100 from timing/rhythm only (pauses, tempo, flow)
  "targetMatchScore": number, // 0-100 semantic/content match to target sentence
  "englishConfidence": number, // 0-100 confidence that utterance is meaningful English
  "isTargetSentence": boolean,
  "transcribedText": string,
  "summary": string,
  "consonantComment": string,
  "vowelComment": string,
  "stressComment": string,
  "pronunciationIssues": [
    { "expected": string, "heard": string, "advice": string }
  ],
  "practiceTips": string[]
}
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Feedback generation failed: ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionsResponse;
  return data.choices?.[0]?.message?.content;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Use multipart/form-data with targetText and audio." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const targetText = String(formData.get("targetText") ?? "").trim();
    const audio = formData.get("audio");

    if (!targetText) {
      return NextResponse.json(
        { error: "targetText is required." },
        { status: 400 },
      );
    }

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "audio file is required." },
        { status: 400 },
      );
    }

    const transcription = await transcribeAudio(audio, apiKey);
    const fallbackTranscribedText = (transcription.text ?? "").trim();
    const words = Array.isArray(transcription.words) ? transcription.words : [];

    if (!fallbackTranscribedText) {
      return NextResponse.json({
        ...fallbackFeedback,
        targetText,
        summary: "Speech was not detected clearly. Please try again.",
      });
    }

    const content = await (async () => {
      try {
        return await generateFeedback(targetText, audio, apiKey);
      } catch {
        return await generateFeedbackFromTranscript(
          targetText,
          fallbackTranscribedText,
          words,
          apiKey,
        );
      }
    })();

    if (!content) {
      return NextResponse.json({
        ...fallbackFeedback,
        targetText,
        transcribedText: fallbackTranscribedText,
      });
    }

    const parsed = JSON.parse(
      stripCodeFence(content),
    ) as Partial<PronunciationFeedback>;
    const transcribedText =
      typeof parsed.transcribedText === "string" &&
      parsed.transcribedText.trim().length > 0
        ? parsed.transcribedText.trim()
        : fallbackTranscribedText;

    return NextResponse.json(
      normalizeFeedback(parsed, targetText, transcribedText),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to analyze pronunciation from audio.", detail: message },
      { status: 500 },
    );
  }
}
