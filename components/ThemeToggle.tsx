"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm ui-text-muted">Theme</p>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setMode("light")}
          className={`rounded-md px-3 py-2 text-sm ${
            mode === "light" ? "ui-btn-primary" : "ui-btn-secondary"
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setMode("dark")}
          className={`rounded-md px-3 py-2 text-sm ${
            mode === "dark" ? "ui-btn-primary" : "ui-btn-secondary"
          }`}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setMode("system")}
          className={`rounded-md px-3 py-2 text-sm ${
            mode === "system" ? "ui-btn-primary" : "ui-btn-secondary"
          }`}
        >
          System
        </button>
      </div>
    </div>
  );
}
