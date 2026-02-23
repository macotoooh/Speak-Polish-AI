"use client";

import { useState } from "react";
import Player from "@/components/Player";
import Recorder from "@/components/Recorder";

export default function Home() {
  const [text, setText] = useState(
    "I am really fortunate to live in Vancouver.",
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Speak & Improve AI 🎙️</h1>

      <textarea
        className="border p-3 rounded w-full max-w-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Player text={text} />

      <Recorder />
    </main>
  );
}
