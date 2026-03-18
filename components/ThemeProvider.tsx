"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "themeMode";
const THEME_MODE_EVENT = "theme-mode-change";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function loadInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isThemeMode(saved)) {
      return saved;
    }
  } catch {
    // ignore localStorage failures
  }

  return "system";
}

function subscribeThemeMode(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };
  const handleCustomEvent = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_MODE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_MODE_EVENT, handleCustomEvent);
  };
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
  const mode = useSyncExternalStore<ThemeMode>(
    subscribeThemeMode,
    loadInitialMode,
    () => "system",
  );

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, nextMode);
      window.dispatchEvent(new Event(THEME_MODE_EVENT));
    } catch {
      // ignore localStorage failures
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
