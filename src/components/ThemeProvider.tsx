"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { themes } from "@/lib/themes";

type Theme = string;

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("theme-catppuccin-mocha");

  useEffect(() => {
    try {
      // Get theme from localStorage or use default
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      const defaultTheme = "theme-catppuccin-mocha";

      if (savedTheme && themes.some((t) => t.id === savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.className = savedTheme;
      } else {
        // Default to Catppuccin Mocha if no saved theme or invalid theme
        setThemeState(defaultTheme);
        document.documentElement.className = defaultTheme;
      }
    } catch {
      // Fallback to default theme if localStorage is not available
      setThemeState("theme-catppuccin-mocha");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // Ignore if localStorage is not available
    }
    document.documentElement.className = newTheme;
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
    return { theme: "theme-catppuccin-mocha" as Theme, setTheme: () => {} };
  }
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
