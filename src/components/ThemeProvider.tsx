"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = 
  | "catppuccin-latte"
  | "catppuccin-frappe"
  | "catppuccin-macchiato"
  | "catppuccin-mocha"
  | "dracula"
  | "dracula-soft";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themeOptions: { value: Theme; label: string; category: string }[] = [
  { value: "catppuccin-latte", label: "Latte", category: "Catppuccin" },
  { value: "catppuccin-frappe", label: "Frappé", category: "Catppuccin" },
  { value: "catppuccin-macchiato", label: "Macchiato", category: "Catppuccin" },
  { value: "catppuccin-mocha", label: "Mocha", category: "Catppuccin" },
  { value: "dracula", label: "Dracula", category: "Dracula" },
  { value: "dracula-soft", label: "Dracula Soft", category: "Dracula" },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("catppuccin-mocha");

  useEffect(() => {
    try {
      // Get theme from localStorage or use default
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme && themeOptions.some(opt => opt.value === savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Default to catppuccin-mocha if no saved theme
        document.documentElement.setAttribute("data-theme", "catppuccin-mocha");
      }
    } catch {
      // Fallback to catppuccin-mocha if localStorage is not available
      setThemeState("catppuccin-mocha");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // Ignore if localStorage is not available
    }
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // During SSR, return default values
  if (typeof window === "undefined") {
    return { theme: "catppuccin-mocha" as Theme, setTheme: () => {} };
  }
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
