"use client";

import { useState } from "react";

export default function Recorder() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={startListening}
        className="px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        🎙 {listening ? "Listening..." : "Record"}
      </button>

      {transcript && (
        <p>
          <strong>You said:</strong> {transcript}
        </p>
      )}
    </div>
  );
}
