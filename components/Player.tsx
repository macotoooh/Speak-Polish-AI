"use client";

import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";
import usePlayerTts from "@/components/player/usePlayerTts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PlayerProps = {
  text: string;
  selectedText?: string;
};

export default function Player({ text, selectedText = "" }: PlayerProps) {
  const { label, icon, isLoading, togglePlayback } = usePlayerTts({
    text,
    selectedText,
  });

  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={() => void togglePlayback()}
      disabled={isLoading}
      variant={BUTTON_VARIANTS.primary}
      size={BUTTON_SIZES.lg}
      fullWidth
      className="sm:w-auto"
    >
      {isLoading ? (
        "Generating..."
      ) : (
        <>
          <FontAwesomeIcon icon={icon} className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
