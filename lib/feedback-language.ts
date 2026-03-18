export const FEEDBACK_LANGUAGE_STORAGE_KEY = "feedbackLanguage";
export const FEEDBACK_LANGUAGE_EVENT = "feedback-language-change";

export const FEEDBACK_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
] as const;

export type FeedbackLanguage =
  (typeof FEEDBACK_LANGUAGE_OPTIONS)[number]["value"];

export const DEFAULT_FEEDBACK_LANGUAGE: FeedbackLanguage = "en";

export function isFeedbackLanguage(value: string): value is FeedbackLanguage {
  return FEEDBACK_LANGUAGE_OPTIONS.some((option) => option.value === value);
}

export function normalizeFeedbackLanguage(
  value: string | null | undefined,
): FeedbackLanguage {
  if (value && isFeedbackLanguage(value)) {
    return value;
  }

  return DEFAULT_FEEDBACK_LANGUAGE;
}

export function getFeedbackLanguageLabel(language: FeedbackLanguage): string {
  switch (language) {
    case "ja":
      return "Japanese";
    case "en":
    default:
      return "English";
  }
}

export function readFeedbackLanguage(): FeedbackLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_FEEDBACK_LANGUAGE;
  }

  try {
    return normalizeFeedbackLanguage(
      localStorage.getItem(FEEDBACK_LANGUAGE_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_FEEDBACK_LANGUAGE;
  }
}

export function subscribeFeedbackLanguage(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FEEDBACK_LANGUAGE_STORAGE_KEY) {
      onStoreChange();
    }
  };
  const handleCustomEvent = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FEEDBACK_LANGUAGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FEEDBACK_LANGUAGE_EVENT, handleCustomEvent);
  };
}
