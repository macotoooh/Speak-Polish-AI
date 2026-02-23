interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: SpeechRecognitionAlternative;
    };
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}
