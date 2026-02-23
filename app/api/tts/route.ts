import { NextResponse } from "next/server";

type TtsRequest = {
  text?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as TtsRequest;
    const text = String(body.text ?? "").trim();

    if (!text) {
      return NextResponse.json({ error: "text is required." }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
        voice: process.env.OPENAI_TTS_VOICE ?? "alloy",
        format: "mp3",
        input: text,
        instructions:
          "Speak naturally with clear pacing, gentle intonation, and conversational rhythm.",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS generation failed: ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate speech.", detail: message },
      { status: 500 },
    );
  }
}
