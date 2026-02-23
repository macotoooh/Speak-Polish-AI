# Speak & Improve AI

Audio-based pronunciation feedback with OpenAI for English practice.

## Setup

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key
# Optional
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## How It Works

1. Enter the sentence you want to practice.
2. Tap `Listen` to hear the model pronunciation.
3. Tap `Record` and speak.
4. The app records your microphone audio and sends it with the target sentence to `/api/pronunciation-feedback`.
5. OpenAI transcribes the audio with word timings, then returns score, issue list, and practical improvement tips.

## Notes

- This is an audio-informed analysis (transcription + timing features), not full phoneme-level lab-grade scoring.
- Browser support depends on `MediaRecorder` and microphone permissions.
