import type { ThemeMode } from "@/components/ThemeProvider";

const STORAGE_KEY = "themeMode";
const THEME_MODE_EVENT = "theme-mode-change";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function readThemeMode(): ThemeMode {
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

export function subscribeThemeMode(onStoreChange: () => void): () => void {
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

export function writeThemeMode(nextMode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(THEME_MODE_EVENT));
  } catch {
    // ignore localStorage failures
  }
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", mode);
}
