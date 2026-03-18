"use client";

import { useTheme } from "@/components/ThemeProvider";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm ui-text-muted">Theme</p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => setMode("light")}
          variant={
            mode === "light"
              ? BUTTON_VARIANTS.primary
              : BUTTON_VARIANTS.secondary
          }
          size={BUTTON_SIZES.md}
        >
          Light
        </Button>
        <Button
          onClick={() => setMode("dark")}
          variant={
            mode === "dark"
              ? BUTTON_VARIANTS.primary
              : BUTTON_VARIANTS.secondary
          }
          size={BUTTON_SIZES.md}
        >
          Dark
        </Button>
        <Button
          onClick={() => setMode("system")}
          variant={
            mode === "system"
              ? BUTTON_VARIANTS.primary
              : BUTTON_VARIANTS.secondary
          }
          size={BUTTON_SIZES.md}
        >
          System
        </Button>
      </div>
    </div>
  );
}
