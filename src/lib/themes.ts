export interface ThemeOption {
  id: string;
  name: string;
  category: string;
  preview: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const themes: ThemeOption[] = [
  {
    id: "theme-catppuccin-latte",
    name: "Latte",
    category: "Catppuccin",
    preview: {
      bg: "#eff1f5",
      primary: "#1e66f5",
      secondary: "#8839ef",
      accent: "#d20f39",
    },
  },
  {
    id: "theme-catppuccin-frappe",
    name: "Frappé",
    category: "Catppuccin",
    preview: {
      bg: "#303446",
      primary: "#8caaee",
      secondary: "#ca9ee6",
      accent: "#ea999c",
    },
  },
  {
    id: "theme-catppuccin-macchiato",
    name: "Macchiato",
    category: "Catppuccin",
    preview: {
      bg: "#24273a",
      primary: "#8aadf4",
      secondary: "#c6a0f6",
      accent: "#ee99a0",
    },
  },
  {
    id: "theme-catppuccin-mocha",
    name: "Mocha",
    category: "Catppuccin",
    preview: {
      bg: "#1e1e2e",
      primary: "#89b4fa",
      secondary: "#cba6f7",
      accent: "#f38ba8",
    },
  },
  {
    id: "theme-dracula",
    name: "Dracula",
    category: "Dracula",
    preview: {
      bg: "#282a36",
      primary: "#8be9fd",
      secondary: "#bd93f9",
      accent: "#ff79c6",
    },
  },
  {
    id: "theme-dracula-midnight",
    name: "Midnight",
    category: "Dracula",
    preview: {
      bg: "#21222c",
      primary: "#80ffea",
      secondary: "#9580ff",
      accent: "#ff80bf",
    },
  },
  {
    id: "theme-dracula-pro",
    name: "Pro",
    category: "Dracula",
    preview: {
      bg: "#22212c",
      primary: "#80ffea",
      secondary: "#9580ff",
      accent: "#ff80bf",
    },
  },
  {
    id: "theme-solarized-light",
    name: "Light",
    category: "Solarized",
    preview: {
      bg: "#fdf6e3",
      primary: "#268bd2",
      secondary: "#2aa198",
      accent: "#d33682",
    },
  },
  {
    id: "theme-solarized-dark",
    name: "Dark",
    category: "Solarized",
    preview: {
      bg: "#002b36",
      primary: "#268bd2",
      secondary: "#2aa198",
      accent: "#d33682",
    },
  },
  {
    id: "theme-monokai",
    name: "Classic",
    category: "Monokai",
    preview: {
      bg: "#272822",
      primary: "#66d9ef",
      secondary: "#a6e22e",
      accent: "#f92672",
    },
  },
  {
    id: "theme-monokai-pro",
    name: "Pro",
    category: "Monokai",
    preview: {
      bg: "#2d2a2e",
      primary: "#78dce8",
      secondary: "#a9dc76",
      accent: "#ff6188",
    },
  },
  {
    id: "theme-gruvbox-light",
    name: "Light",
    category: "Gruvbox",
    preview: {
      bg: "#fbf1c7",
      primary: "#076678",
      secondary: "#79740e",
      accent: "#9d0006",
    },
  },
  {
    id: "theme-gruvbox-dark",
    name: "Dark",
    category: "Gruvbox",
    preview: {
      bg: "#282828",
      primary: "#83a598",
      secondary: "#b8bb26",
      accent: "#fb4934",
    },
  },
  {
    id: "theme-atom-light",
    name: "Light",
    category: "Atom",
    preview: {
      bg: "#fafafa",
      primary: "#4078f2",
      secondary: "#50a14f",
      accent: "#e45649",
    },
  },
  {
    id: "theme-atom-dark",
    name: "Dark",
    category: "Atom",
    preview: {
      bg: "#282c34",
      primary: "#61afef",
      secondary: "#98c379",
      accent: "#e06c75",
    },
  },
  {
    id: "theme-syntax-fm",
    name: "Syntax",
    category: "Syntax",
    preview: {
      bg: "#000000",
      primary: "#6dfff8",
      secondary: "#fabf46",
      accent: "#cf256d",
    },
  },
  {
    id: "theme-tokyonight-storm",
    name: "Storm",
    category: "Tokyo Night",
    preview: {
      bg: "#24283b",
      primary: "#7aa2f7",
      secondary: "#9d7cd8",
      accent: "#f7768e",
    },
  },
  {
    id: "theme-tokyonight-night",
    name: "Night",
    category: "Tokyo Night",
    preview: {
      bg: "#1a1b26",
      primary: "#7aa2f7",
      secondary: "#9d7cd8",
      accent: "#f7768e",
    },
  },
  {
    id: "theme-tokyonight-moon",
    name: "Moon",
    category: "Tokyo Night",
    preview: {
      bg: "#222436",
      primary: "#82aaff",
      secondary: "#c099ff",
      accent: "#ff757f",
    },
  },
  {
    id: "theme-nord",
    name: "Nord",
    category: "Nord",
    preview: {
      bg: "#2e3440",
      primary: "#88c0d0",
      secondary: "#81a1c1",
      accent: "#bf616a",
    },
  },
  {
    id: "theme-nord-light",
    name: "Light",
    category: "Nord",
    preview: {
      bg: "#eceff4",
      primary: "#5e81ac",
      secondary: "#81a1c1",
      accent: "#bf616a",
    },
  },
  {
    id: "theme-rosepine",
    name: "Rosé Pine",
    category: "Rosé Pine",
    preview: {
      bg: "#191724",
      primary: "#9ccfd8",
      secondary: "#c4a7e7",
      accent: "#ebbcba",
    },
  },
  {
    id: "theme-rosepine-moon",
    name: "Moon",
    category: "Rosé Pine",
    preview: {
      bg: "#232136",
      primary: "#9ccfd8",
      secondary: "#c4a7e7",
      accent: "#ea9a97",
    },
  },
  {
    id: "theme-rosepine-dawn",
    name: "Dawn",
    category: "Rosé Pine",
    preview: {
      bg: "#faf4ed",
      primary: "#286983",
      secondary: "#907aa9",
      accent: "#d7827e",
    },
  },
  {
    id: "theme-root-loops",
    name: "Root Loops",
    category: "Root Loops",
    preview: {
      bg: "#1a1a2e",
      primary: "#ff6b6b",
      secondary: "#4ecdc4",
      accent: "#ffe66d",
    },
  },
  {
    id: "theme-cyberpunk-neon",
    name: "Cyberpunk Neon",
    category: "Cyberpunk Neon",
    preview: {
      bg: "#000b1e",
      primary: "#0abdc6",
      secondary: "#711c91",
      accent: "#ea00d9",
    },
  },
  {
    id: "theme-monochrome-dark",
    name: "Dark",
    category: "Monochrome",
    preview: {
      bg: "#0a0a0a",
      primary: "#e0e0e0",
      secondary: "#a0a0a0",
      accent: "#ffffff",
    },
  },
  {
    id: "theme-monochrome-light",
    name: "Light",
    category: "Monochrome",
    preview: {
      bg: "#ffffff",
      primary: "#1a1a1a",
      secondary: "#505050",
      accent: "#0a0a0a",
    },
  },
];
