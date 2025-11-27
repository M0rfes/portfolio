"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, User, MessageCircle, BookOpen } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ThemePicker } from './ThemePicker';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 10]);

  const navItems = [
    { id: "about", label: "About", icon: User, href: "/about" },
    { id: "blogs", label: "Blogs", icon: BookOpen, href: "/blogs" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-background border-b border-border"
        style={{ backdropFilter: `blur(${backdropBlur}px)` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo - Clicking redirects to home */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-3 cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                  <ImageWithFallback 
                    src="/me.avif" 
                    alt="Fahim Khan Profile" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg text-secondary">Fahim Khan</div>
                  <div className="text-xs text-muted-foreground">Software Consultant</div>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Menu */}
            <motion.div
              className="hidden md:flex items-center gap-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navItems.map((item, index) => (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                      (item.id === "blogs" && pathname.startsWith('/blogs')) ||
                      (item.id === "about" && pathname === '/about')
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:text-primary hover:bg-muted"
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
              ))}
              
              {/* Theme Picker */}
              <ThemePicker />
            </motion.div>

            {/* Mobile Menu Button and Theme Picker */}
            <div className="md:hidden flex items-center gap-2">
              <ThemePicker />
              <motion.button
                className="p-2 rounded-lg bg-card border border-border"
              onClick={() => setIsOpen(!isOpen)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
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
        className="fixed top-0 right-0 bottom-0 w-80 bg-card shadow-2xl z-50 md:hidden border-l border-border"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="p-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
                  <ImageWithFallback 
                    src="/me.avif" 
                    alt="Fahim Khan Profile" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="text-lg text-primary">Fahim Khan</div>
                  <div className="text-xs text-muted-foreground">Software Consultant</div>
                </div>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X className="w-6 h-6 text-primary" />
            </button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="space-y-4">
            {navItems.map((item, index) => (
              <Link key={item.id} href={item.href}>
                <motion.div
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                    (item.id === "blogs" && pathname.startsWith('/blogs')) ||
                    (item.id === "about" && pathname === '/about')
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
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
            ))}
          </div>

          {/* Mobile Contact Info */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Quick Contact</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-xs">✉</span>
                </div>
                <span className="text-foreground">fahimkhan20148@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-secondary text-xs">📱</span>
                </div>
                <span className="text-foreground">+971 507 286 133</span>
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
          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </motion.a>
      </motion.div>
    </>
  );
}