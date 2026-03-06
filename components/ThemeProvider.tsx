"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "themeMode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // ignore localStorage failures
  }

  return "system";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(loadInitialMode);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);

    try {
      localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // ignore localStorage failures
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
