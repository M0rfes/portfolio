"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Home, User, Briefcase, Code, MessageCircle, BookOpen, Moon, Sun } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from './ThemeProvider';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { scrollY } = useScroll();
  
  const lightBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  );
  
  const darkBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(10, 15, 28, 0)", "rgba(10, 15, 28, 0.95)"]
  );
  
  const backgroundColor = theme === "light" ? lightBg : darkBg;
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 10]);

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
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
        style={{ backgroundColor, backdropFilter: `blur(${backdropBlur}px)` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src="/me.avif" 
                  alt="Fahim Khan Profile" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg text-[var(--portfolio-primary)]">Fahim Khan</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Software Consultant</div>
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
                )
              ))}
              
              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full transition-all duration-300 text-gray-700 hover:text-[var(--portfolio-primary)] hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button and Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-[var(--portfolio-primary)]" />
                ) : (
                  <Sun className="w-5 h-5 text-[var(--portfolio-primary)]" />
                )}
              </motion.button>
              <motion.button
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50"
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
      </motion.nav>

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
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] rounded-lg flex items-center justify-center overflow-hidden">
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
          className="w-14 h-14 bg-gradient-to-r from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] rounded-full flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.a>
      </motion.div>
    </>
  );
}