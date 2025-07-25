"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Home, User, Briefcase, Code, MessageCircle } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  );
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 10]);

  const navItems = [
    { id: "hero", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Code },
    { id: "contact", label: "Contact", icon: MessageCircle }
  ];

  // Handle scroll spy
  useEffect(() => {
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
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
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
                <div className="text-xs text-gray-600">Software Consultant</div>
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
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeSection === item.id
                      ? "bg-[var(--portfolio-primary)] text-white shadow-lg"
                      : "text-gray-700 hover:text-[var(--portfolio-primary)] hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50"
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
        className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden"
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
                <div className="text-xs text-gray-600">Software Consultant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-[var(--portfolio-primary)]" />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-4">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? "bg-[var(--portfolio-primary)] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Quick Contact</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--portfolio-primary)]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[var(--portfolio-primary)] text-xs">✉</span>
                </div>
                <span className="text-gray-700">fahimkhan20148@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--portfolio-secondary)]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[var(--portfolio-secondary)] text-xs">📱</span>
                </div>
                <span className="text-gray-700">+971 507 286 133</span>
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