"use client";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Home, User, Briefcase, Code, MessageCircle, BookOpen, Palette, ChevronDown } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme, themeOptions } from './ThemeProvider';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "hero", label: "Home", icon: Home, href: "/" },
    { id: "about", label: "About", icon: User, href: "/#about" },
    { id: "experience", label: "Experience", icon: Briefcase, href: "/#experience" },
    { id: "skills", label: "Skills", icon: Code, href: "/#skills" },
    { id: "blogs", label: "Blogs", icon: BookOpen, href: "/blogs" },
    { id: "contact", label: "Contact", icon: MessageCircle, href: "/#contact" }
  ];

  // Handle scroll spy
  useEffect(() => {
    if (!isHomePage) return;
    
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Handle click outside to close theme menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showThemeMenu]);

  const handleNavigation = (item: typeof navItems[0]) => {
    if (isHomePage && item.id !== "blogs") {
      // Scroll to section on home page
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src="/me.avif" 
                  alt="Fahim Khan Profile" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg text-[var(--primary)]">Fahim Khan</div>
                <div className="text-xs text-[var(--muted-foreground)]">Software Consultant</div>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navItems.map((item, index) => (
                item.id === "blogs" ? (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                        pathname.startsWith('/blogs')
                          ? "bg-[var(--portfolio-primary)] text-white shadow-lg"
                          : "text-gray-700 hover:text-[var(--portfolio-primary)] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                ) : (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      onClick={() => handleNavigation(item)}
                      className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeSection === item.id && isHomePage
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg"
                          : "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                )
              ))}
              
              {/* Theme Selector Dropdown */}
              <div className="relative" ref={themeMenuRef}>
                <motion.button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  aria-label="Select theme"
                >
                  <Palette className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
                </motion.button>
                
                {showThemeMenu && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {['Catppuccin', 'Dracula'].map((category) => (
                      <div key={category}>
                        <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--muted)]">
                          {category}
                        </div>
                        {themeOptions
                          .filter(opt => opt.category === category)
                          .map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setTheme(option.value);
                                setShowThemeMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                theme === option.value
                                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <motion.button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg bg-[var(--card)]/80 backdrop-blur-sm shadow-lg border border-[var(--border)]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                aria-label="Select theme"
              >
                <Palette className="w-5 h-5 text-[var(--primary)]" />
              </motion.button>
              
              {/* Mobile theme menu */}
              {showThemeMenu && (
                <motion.div
                  className="fixed top-16 right-4 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {['Catppuccin', 'Dracula'].map((category) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--muted)]">
                        {category}
                      </div>
                      {themeOptions
                        .filter(opt => opt.category === category)
                        .map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setTheme(option.value);
                              setShowThemeMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              theme === option.value
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  ))}
                </motion.div>
              )}
              
              <motion.button
                className="p-2 rounded-lg bg-[var(--card)]/80 backdrop-blur-sm shadow-lg border border-[var(--border)]"
              onClick={() => setIsOpen(!isOpen)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-[var(--portfolio-primary)]" />
              ) : (
                <Menu className="w-6 h-6 text-[var(--portfolio-primary)]" />
              )}
            </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <motion.div
        className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="p-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src="/me.avif" 
                  alt="Fahim Khan Profile" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="text-lg text-[var(--portfolio-primary)]">Fahim Khan</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Software Consultant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-6 h-6 text-[var(--portfolio-primary)]" />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-4">
            {navItems.map((item, index) => (
              item.id === "blogs" ? (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      pathname.startsWith('/blogs')
                        ? "bg-[var(--portfolio-primary)] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              ) : (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      activeSection === item.id && isHomePage
                        ? "bg-[var(--portfolio-primary)] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              )
            ))}
          </div>

          {/* Mobile Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Quick Contact</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--portfolio-primary)]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[var(--portfolio-primary)] text-xs">✉</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">fahimkhan20148@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--portfolio-secondary)]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[var(--portfolio-secondary)] text-xs">📱</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">+971 507 286 133</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button for mobile */}
      <motion.div
        className="fixed bottom-6 right-6 md:hidden z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.a
          href="mailto:fahimkhan20148@gmail.com"
          className="w-14 h-14 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.a>
      </motion.div>
    </>
  );
}