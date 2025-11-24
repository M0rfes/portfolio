"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

const themeMap: Record<string, string> = {
  "theme-catppuccin-latte": "one-light.css", // Fallback
  "theme-catppuccin-frappe": "material-oceanic.css", // Fallback
  "theme-catppuccin-macchiato": "material-oceanic.css", // Fallback
  "theme-catppuccin-mocha": "material-dark.css", // Fallback
  "theme-dracula": "dracula.css",
  "theme-dracula-midnight": "dracula.css",
  "theme-dracula-pro": "dracula.css",
  "theme-solarized-light": "solarized-light.css",
  "theme-solarized-dark": "solarized-dark.css",
  "theme-monokai": "monokai.css",
  "theme-monokai-pro": "monokai.css",
  "theme-gruvbox-light": "gruvbox-light.css",
  "theme-gruvbox-dark": "gruvbox-dark.css",
  "theme-atom-light": "one-light.css",
  "theme-atom-dark": "one-dark.css",
  "theme-syntax-fm": "synthwave84.css",
  "theme-tokyonight-storm": "vsc-dark-plus.css",
  "theme-tokyonight-night": "vsc-dark-plus.css",
  "theme-tokyonight-moon": "night-owl.css",
  "theme-nord": "nord.css",
  "theme-nord-light": "nord.css",
  "theme-rosepine": "night-owl.css",
  "theme-rosepine-moon": "material-oceanic.css",
  "theme-rosepine-dawn": "one-light.css",
  "theme-root-loops": "synthwave84.css",
  "theme-cyberpunk-neon-tweetdeck": "cyberpunk-neon.css",
  "theme-cyberpunk-neon-startpage": "cyberpunk-neon.css",
  "theme-cyberpunk-neon-mastodon": "cyberpunk-neon.css",
  "theme-monochrome-dark": "monochrome-dark.css",
  "theme-monochrome-light": "monochrome-light.css",
};

export function PrismThemeSync() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themeFile = themeMap[theme] || "dracula.css";

  return (
    <link
      rel="stylesheet"
      href={`/prism-themes/${themeFile}`}
      crossOrigin="anonymous"
    />
  );
}
