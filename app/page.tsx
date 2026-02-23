"use client";

import { useState } from "react";
import Player from "@/components/Player";
import Recorder from "@/components/Recorder";
import type { PronunciationFeedback } from "@/types/pronunciation";

export default function Home() {
  const [text, setText] = useState("The weather in Vancouver is often rainy.");
  const [spokenText, setSpokenText] = useState("");
  const [aiFeedback, setAiFeedback] = useState<PronunciationFeedback | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const analyzePronunciationFromAudio = async (
    targetText: string,
    audioBlob: Blob,
  ) => {
    setIsAnalyzing(true);
    setFeedbackError(null);
    setAiFeedback(null);
    setSpokenText("");

    try {
      const formData = new FormData();
      formData.append("targetText", targetText);
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/pronunciation-feedback", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
          detail?: string;
        } | null;
        const detailMessage = errorPayload?.detail
          ? ` (${errorPayload.detail})`
          : "";
        throw new Error(
          `${errorPayload?.error ?? "Failed to analyze pronunciation."}${detailMessage}`,
        );
      }

      const result = (await response.json()) as PronunciationFeedback;
      setAiFeedback(result);
      setSpokenText(result.transcribedText);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to analyze pronunciation.";
      setFeedbackError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecordedAudio = (audioBlob: Blob) => {
    void analyzePronunciationFromAudio(text, audioBlob);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Speak & Improve AI 🎙️</h1>

      <textarea
        className="border p-3 rounded w-full max-w-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
        name="targetText"
      />

      <Player text={text} />

      <Recorder onRecorded={handleRecordedAudio} disabled={isAnalyzing} />

      {spokenText && (
        <p className="text-gray-700">
          <strong>You said:</strong> {spokenText}
        </p>
      )}

      {(isAnalyzing || aiFeedback || feedbackError) && (
        <section className="w-full max-w-2xl rounded-lg border p-4">
          <h2 className="text-lg font-semibold">AI Pronunciation Feedback</h2>

          {isAnalyzing && (
            <p className="mt-2 text-gray-600">Analyzing your speech...</p>
          )}

          {feedbackError && (
            <p className="mt-2 text-red-600">{feedbackError}</p>
          )}

          {aiFeedback && (
            <div className="mt-3 space-y-3">
              <p>
                <strong>AI Score:</strong> {aiFeedback.overallScore}/100
              </p>
              <p className="text-sm text-gray-500">
                Score basis: AI overall score from audio analysis.
              </p>
              <p>
                <strong>Evaluated sentence:</strong> {aiFeedback.targetText}
              </p>
              <p>{aiFeedback.summary}</p>
              <div className="space-y-1">
                <p>
                  <strong>Consonants:</strong> {aiFeedback.consonantComment}
                </p>
                <p>
                  <strong>Vowels:</strong> {aiFeedback.vowelComment}
                </p>
                <p>
                  <strong>Stress:</strong> {aiFeedback.stressComment}
                </p>
              </div>

              {aiFeedback.pronunciationIssues.length > 0 && (
                <div>
                  <p className="font-medium">Pronunciation Issues</p>
                  <ul className="list-disc pl-5">
                    {aiFeedback.pronunciationIssues.map((issue, index) => (
                      <li key={`${issue.expected}-${index}`}>
                        expected: <strong>{issue.expected}</strong> / heard:{" "}
                        <strong>{issue.heard}</strong> / tip: {issue.advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiFeedback.practiceTips.length > 0 && (
                <div>
                  <p className="font-medium">How to Improve</p>
                  <ul className="list-disc pl-5">
                    {aiFeedback.practiceTips.map((tip, index) => (
                      <li key={`${tip}-${index}`}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
