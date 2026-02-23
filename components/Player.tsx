"use client";

export default function Player({ text }: { text: string }) {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      🔊 Listen
    </button>
  );
}
