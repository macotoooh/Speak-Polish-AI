"use client";

import {
  DEFAULT_FEEDBACK_LANGUAGE,
  FEEDBACK_LANGUAGE_EVENT,
  FEEDBACK_LANGUAGE_OPTIONS,
  FEEDBACK_LANGUAGE_STORAGE_KEY,
  readFeedbackLanguage,
  subscribeFeedbackLanguage,
} from "@/lib/feedback-language";
import { useSyncExternalStore } from "react";

export default function FeedbackLanguageSelect() {
  const language = useSyncExternalStore(
    subscribeFeedbackLanguage,
    readFeedbackLanguage,
    () => DEFAULT_FEEDBACK_LANGUAGE,
  );

  const handleChange = (nextLanguage: (typeof FEEDBACK_LANGUAGE_OPTIONS)[number]["value"]) => {
    try {
      localStorage.setItem(FEEDBACK_LANGUAGE_STORAGE_KEY, nextLanguage);
      window.dispatchEvent(new Event(FEEDBACK_LANGUAGE_EVENT));
    } catch {
      // ignore localStorage failures
    }
  };

  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm ui-text-muted">Feedback language</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FEEDBACK_LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={`rounded-md px-3 py-2 text-sm ${
              language === option.value ? "ui-btn-primary" : "ui-btn-secondary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="ui-text-muted text-xs">
        Feedback explanations and pronunciation comments will use this
        language.
      </p>
    </div>
  );
}
