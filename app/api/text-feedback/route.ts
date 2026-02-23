import { NextResponse } from "next/server";
import type { TextFeedbackResponse } from "@/types/text-feedback";

type ChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type TextFeedbackRequest = {
  fullText?: string;
  selectedText?: string;
};

function stripCodeFence(text: string): string {
  return text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeTextFeedback(
  input: Partial<TextFeedbackResponse>,
  selectedText: string,
): TextFeedbackResponse {
  const explanation =
    typeof input.explanation === "string" && input.explanation.trim().length > 0
      ? input.explanation.trim()
      : "No explanation available.";

  const suggestions = Array.isArray(input.suggestions)
    ? input.suggestions
        .filter((suggestion) => typeof suggestion === "string")
        .map((suggestion) => suggestion.trim())
        .filter((suggestion) => suggestion.length > 0)
        .slice(0, 3)
    : [];

  return {
    selectedText,
    explanation,
    suggestions,
  };
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
    const body = (await request.json()) as TextFeedbackRequest;
    const fullText = String(body.fullText ?? "").trim();
    const selectedText = String(body.selectedText ?? "").trim();

    if (!selectedText) {
      return NextResponse.json(
        { error: "selectedText is required." },
        { status: 400 },
      );
    }

    const systemPrompt =
      "You are an English writing coach. Explain grammar and wording clearly and concisely.";
    const userPrompt = `
Full text:
${fullText}

Selected text:
${selectedText}

Return strict JSON with this schema:
{
  "explanation": string, // grammar and phrasing explanation in simple English
  "suggestions": string[] // up to 3 improved rewrites of selected text
}
Rules:
- Keep suggestions faithful to the original meaning.
- Prefer natural spoken English.
- Do not include markdown or extra keys.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_FEEDBACK_MODEL ?? "gpt-4.1-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Text feedback generation failed: ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionsResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        normalizeTextFeedback({}, selectedText),
      );
    }

    const parsed = JSON.parse(stripCodeFence(content)) as Partial<TextFeedbackResponse>;
    return NextResponse.json(normalizeTextFeedback(parsed, selectedText));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to analyze selected text.", detail: message },
      { status: 500 },
    );
  }
}
