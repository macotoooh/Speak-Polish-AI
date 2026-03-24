import type { RefObject } from "react";
import DifficultySelect from "@/components/DifficultySelect";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import { getGenerateButtonLabel } from "@/components/practice/helpers";
import type { SelectionRange } from "@/components/practice/types";
import type { ExampleSentenceLevel } from "@/lib/example-sentence-level";

type SentenceEditorSectionProps = {
  difficultyLevel: ExampleSentenceLevel;
  isGeneratingSentence: boolean;
  sentenceGenerationError: string | null;
  text: string;
  selectedText: string;
  selectionRange: SelectionRange | null;
  isTextAnalyzing: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  recommendedSentence: string | null;
  recommendedWeaknessLabel: string | null;
  isGeneratingRecommendedSentence: boolean;
  recommendedSentenceError: string | null;
  onDifficultyChange: (value: ExampleSentenceLevel) => void;
  onGenerateSentence: () => void;
  onUseRecommendedSentence: () => void;
  onRefreshRecommendedSentence: () => void;
  onTextChange: (value: string) => void;
  onTextSelect: () => void;
  onAnalyzeText: () => void;
};

export default function SentenceEditorSection({
  difficultyLevel,
  isGeneratingSentence,
  sentenceGenerationError,
  text,
  selectedText,
  selectionRange,
  isTextAnalyzing,
  textareaRef,
  recommendedSentence,
  recommendedWeaknessLabel,
  isGeneratingRecommendedSentence,
  recommendedSentenceError,
  onDifficultyChange,
  onGenerateSentence,
  onUseRecommendedSentence,
  onRefreshRecommendedSentence,
  onTextChange,
  onTextSelect,
  onAnalyzeText,
}: SentenceEditorSectionProps) {
  
  // Render this section only when there is recommendation-related content or state to show.
  const shouldShowRecommendedSection =
    Boolean(recommendedSentence) ||
    Boolean(recommendedWeaknessLabel) ||
    isGeneratingRecommendedSentence ||
    Boolean(recommendedSentenceError);

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="ui-card rounded-lg p-4">
        <div className="space-y-4">
          <DifficultySelect
            value={difficultyLevel}
            onChange={onDifficultyChange}
            disabled={isGeneratingSentence}
          />
          <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="ui-text-muted text-sm">
              Generate a new practice sentence based on the selected difficulty.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onGenerateSentence}
                disabled={isGeneratingSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.md}
                fullWidth
                className="sm:w-auto"
              >
                {getGenerateButtonLabel(text, isGeneratingSentence)}
              </Button>
            </div>
          </div>
        </div>
        {sentenceGenerationError && (
          <p className="mt-3 text-sm text-red-600">{sentenceGenerationError}</p>
        )}
      </div>
      {shouldShowRecommendedSection && (
        <div className="ui-card rounded-lg border-dashed p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Recommended practice focus</p>
              <p className="ui-text-muted text-xs">
                This is a suggested sentence only. It will not be evaluated
                until you apply it to the practice field below.
              </p>
              {recommendedWeaknessLabel && (
                <p className="ui-text-muted text-sm">
                  Based on your recent history: {recommendedWeaknessLabel}
                </p>
              )}
            </div>
            <Button
              onClick={onRefreshRecommendedSentence}
              disabled={isGeneratingRecommendedSentence}
              variant={BUTTON_VARIANTS.secondary}
              size={BUTTON_SIZES.md}
              fullWidth
              className="sm:w-auto"
            >
              {isGeneratingRecommendedSentence
                ? "Refreshing..."
                : "Refresh recommendation"}
            </Button>
          </div>
          {recommendedSentence && (
            <>
              <div className="mt-3 rounded-md bg-surface-2 px-4 py-3">
                <p className="text-sm leading-7">{recommendedSentence}</p>
              </div>
              <Button
                onClick={onUseRecommendedSentence}
                variant={BUTTON_VARIANTS.primary}
                size={BUTTON_SIZES.md}
                fullWidth
                className="mt-3 sm:w-auto"
              >
                Apply to practice field
              </Button>
            </>
          )}
          {recommendedSentenceError && (
            <p className="mt-3 text-sm text-red-600">
              {recommendedSentenceError}
            </p>
          )}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium">Current sentence to practice</p>
        <p className="ui-text-muted text-xs">
          This text is the target used for `Listen`, `Record`, and pronunciation
          evaluation.
        </p>
      </div>
      <textarea
        ref={textareaRef}
        className="ui-input w-full rounded p-3 selection:bg-slate-300 selection:text-slate-900"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        onSelect={onTextSelect}
        name="targetText"
        rows={4}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="ui-text-muted line-clamp-2 text-sm">
          {selectedText
            ? `Selected: "${selectedText}"`
            : "Select text to analyze or listen"}
        </p>
        <Button
          onClick={onAnalyzeText}
          disabled={!selectionRange || isTextAnalyzing}
          variant={BUTTON_VARIANTS.secondary}
          size={BUTTON_SIZES.md}
          fullWidth
          className="sm:w-auto"
        >
          {isTextAnalyzing ? "Analyzing..." : "Analyze text"}
        </Button>
      </div>
    </div>
  );
}
