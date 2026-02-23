"use client";

import { useRef, useState } from "react";

export default function Player({ text }: { text: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const getPreferredVoice = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return null;
    }

    const preferredNames = [
      "Samantha",
      "Google US English",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Aria Online (Natural) - English (United States)",
    ];

    const matchedByName = preferredNames
      .map((name) => voices.find((voice) => voice.name === name))
      .find((voice) => Boolean(voice));

    if (matchedByName) {
      return matchedByName;
    }

    const englishVoice =
      voices.find((voice) => voice.lang === "en-US") ??
      voices.find((voice) => voice.lang.startsWith("en-")) ??
      voices[0];

    return englishVoice;
  };

  const speakWithBrowserVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  };

  const speak = async () => {
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech from TTS API.");
      }

      const audioBlob = await response.blob();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      objectUrlRef.current = objectUrl;

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        audioRef.current = null;
      };
      await audio.play();
    } catch {
      speakWithBrowserVoice();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={() => void speak()}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-60"
    >
      {isLoading ? "Generating..." : "🔊 Listen"}
    </button>
  );
}
