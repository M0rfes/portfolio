"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

import { themes, ThemeOption } from "@/lib/themes";

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const groupedThemes = themes.reduce(
    (acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    },
    {} as Record<string, ThemeOption[]>,
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Picker Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-picker-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Select theme"
      >
        <Palette className="theme-picker-icon" />
      </motion.button>

      {/* Theme Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="theme-picker-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="theme-picker-header">
              <Palette className="theme-picker-title-icon" />
              <span className="theme-picker-title">Select Theme</span>
            </div>

            <div className="theme-picker-content">
              {Object.entries(groupedThemes).map(
                ([category, categoryThemes]) => (
                  <div key={category} className="theme-category">
                    <h3 className="theme-category-title">{category}</h3>
                    <div className="theme-options">
                      {categoryThemes.map((themeOption) => (
                        <motion.button
                          key={themeOption.id}
                          onClick={() => {
                            setTheme(themeOption.id);
                            setIsOpen(false);
                          }}
                          className={`theme-option ${
                            theme === themeOption.id
                              ? "theme-option-active"
                              : ""
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="theme-preview">
                            <div
                              className="theme-preview-bg"
                              style={{
                                backgroundColor: themeOption.preview.bg,
                              }}
                            />
                            <div className="theme-preview-colors">
                              <div
                                className="theme-preview-color"
                                style={{
                                  backgroundColor: themeOption.preview.primary,
                                }}
                              />
                              <div
                                className="theme-preview-color"
                                style={{
                                  backgroundColor:
                                    themeOption.preview.secondary,
                                }}
                              />
                              <div
                                className="theme-preview-color"
                                style={{
                                  backgroundColor: themeOption.preview.accent,
                                }}
                              />
                            </div>
                          </div>
                          <span className="theme-option-name">
                            {themeOption.name}
                          </span>
                          {theme === themeOption.id && (
                            <Check className="theme-option-check" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
