"use client";
import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Send,
  Globe,
} from "lucide-react";

// Type definitions
interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  link: string;
  color: string;
}

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  username: string;
  url: string;
  color: string;
}

// TypeWriter Component
function TypeWriter({
  text,
  delay = 0,
  speed = 30,
  className = "",
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Start typing after delay
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      // Hide cursor after typing is complete
      const cursorTimeout = setTimeout(() => {
        setShowCursor(false);
      }, 1000);

      return () => clearTimeout(cursorTimeout);
    }
  }, [currentIndex, text, speed, hasStarted]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span
          className={`inline-block w-0.5 h-4 bg-white ml-1 ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
        />
      )}
    </span>
  );
}

// Individual Contact Card Component
function ContactCard({
  contact,
  index,
}: {
  contact: ContactInfo;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  return (
    <motion.a
      ref={ref}
      key={index}
      href={contact.link}
      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group"
      initial={{ y: 30, opacity: 0 }}
      animate={
        isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
      }
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      }}
      whileHover={{
        scale: 1.02,
        x: 10,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeOut" },
      }}
    >
      <div
        className={`p-3 rounded-lg bg-white/20 ${contact.color} group-hover:scale-110 transition-transform duration-300`}
      >
        <contact.icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-sm opacity-70">
          {contact.label}
        </div>
        <div className="text-lg">{contact.value}</div>
      </div>
    </motion.a>
  );
}

// Individual Social Card Component
function SocialCard({
  social,
  index,
}: {
  social: SocialLink;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  return (
    <motion.a
      ref={ref}
      key={index}
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group ${social.color}`}
      initial={{ y: 30, opacity: 0 }}
      animate={
        isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
      }
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1,
      }}
      whileHover={{
        scale: 1.05,
        y: -5,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1, ease: "easeOut" },
      }}
    >
      <div className="flex items-center gap-3">
        <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
        <div>
          <div className="text-sm opacity-70">
            {social.label}
          </div>
          <div className="text-sm">{social.username}</div>
        </div>
      </div>
    </motion.a>
  );
}

// Animated Section Component
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: 30, opacity: 0 }}
      animate={
        isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

// Status Card with Typing Animation
function StatusCard({ delay = 0 }: { delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  const statusText =
    "Currently working full-time at Presight AI while actively seeking exciting freelance projects and full-time opportunities globally. Open to remote work and relocation for the right opportunity that aligns with my goals.";

  return (
    <motion.div
      ref={ref}
      className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
      initial={{ y: 30, opacity: 0 }}
      animate={
        isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }
      }
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      <h4 className="text-lg mb-4 flex items-center gap-2">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        Currently Available
      </h4>
      <p className="opacity-90 text-sm leading-relaxed">
        <TypeWriter
          text={statusText}
          delay={1200} // Start typing 1200ms after card animates in (400ms delay + 600ms animation + 200ms pause)
          speed={25} // Speed of typing (ms per character)
        />
      </p>
    </motion.div>
  );
}

export function Contact() {
  const ref = useRef(null);

  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      label: "Email",
      value: "fahimkhan20148@gmail.com",
      link: "mailto:fahimkhan20148@gmail.com",
      color: "text-[var(--portfolio-primary)]",
    },
    {
      icon: Phone,
      label: "UAE Mobile",
      value: "+971 507 286 133",
      link: "tel:+971507286133",
      color: "text-[var(--portfolio-secondary)]",
    },
    {
      icon: Phone,
      label: "India Mobile",
      value: "+91 9167119031",
      link: "tel:+919167119031",
      color: "text-[var(--portfolio-accent)]",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Abu Dhabi, UAE",
      link: "#",
      color: "text-[var(--portfolio-success)]",
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      icon: Github,
      label: "GitHub",
      username: "@M0rfes",
      url: "https://github.com/M0rfes",
      color: "hover:bg-gray-900",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      username: "fahim-khan-232533346",
      url: "https://www.linkedin.com/in/fahim-khan-232533346/",
      color: "hover:bg-blue-600",
    },
    {
      icon: Twitter,
      label: "X (Twitter)",
      username: "@M0rfes",
      url: "https://x.com/M0rfes",
      color: "hover:bg-black",
    },
    {
      icon: Instagram,
      label: "Instagram",
      username: "@m0rfes",
      url: "https://www.instagram.com/m0rfes/",
      color: "hover:bg-pink-600",
    },
    {
      icon: Facebook,
      label: "Facebook",
      username: "M0rfes",
      url: "https://www.facebook.com/M0rfes",
      color: "hover:bg-blue-800",
    },
    {
      icon: Globe,
      label: "BlueSky",
      username: "morfes.bsky.social",
      url: "https://bsky.app/profile/morfes.bsky.social",
      color: "hover:bg-sky-500",
    },
  ];

  return (
    <section
      id="contact"
      className="py-20 px-4 bg-gradient-to-br from-[var(--portfolio-primary)] via-[var(--portfolio-secondary)] to-[var(--portfolio-accent)] text-white"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-6">
            Let&apos;s Build Something Amazing
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Ready to collaborate on your next project? Let&apos;s
            connect and create innovative solutions together.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div>
            <AnimatedSection delay={0.2}>
              <h3 className="text-2xl mb-8 flex items-center gap-3">
                <Send className="w-6 h-6" />
                Get In Touch
              </h3>
            </AnimatedSection>

            <div className="space-y-6 mb-12">
              {contactInfo.map((contact, index) => (
                <ContactCard
                  key={index}
                  contact={contact}
                  index={index}
                />
              ))}
            </div>

            {/* Current Status with Typing Animation */}
            <StatusCard delay={0.4} />
          </div>

          {/* Social Links & CTA */}
          <div>
            <AnimatedSection delay={0.3}>
              <h3 className="text-2xl mb-8">Connect With Me</h3>
            </AnimatedSection>

            {/* Social Media Grid */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              {socialLinks.map((social, index) => (
                <SocialCard
                  key={index}
                  social={social}
                  index={index}
                />
              ))}
            </div>

            {/* Quick Stats */}
            <AnimatedSection className="space-y-4" delay={0.5}>
              <h4 className="text-lg mb-4">Quick Facts</h4>
              <div className="space-y-3 text-sm">
                {[
                  "🚀 Currently working at Presight AI on LLM-powered solutions",
                  "💼 Freelancing for multiple clients to maximize income",
                  "👨‍👩‍👧‍👦 Supporting family while building financial stability",
                  "🎯 Goal: Achieve debt-free life and retire at 40",
                  "⏰ Sometimes working 20 hours a day to meet deadlines",
                ].map((fact, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <span>{fact}</span>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* CTA Button */}
            <AnimatedSection className="mt-8" delay={0.6}>
              <motion.a
                href="mailto:fahimkhan20148@gmail.com"
                className="inline-flex items-center gap-3 bg-white text-[var(--portfolio-primary)] px-8 py-4 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-lg"
                whileHover={{
                  scale: 1.05,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                }}
                whileTap={{
                  scale: 0.95,
                  transition: {
                    duration: 0.1,
                    ease: "easeOut",
                  },
                }}
              >
                <Mail className="w-5 h-5" />
                Start a Conversation
              </motion.a>
            </AnimatedSection>
          </div>
        </div>

        {/* Footer */}
        <AnimatedSection
          className="mt-16 pt-8 border-t border-white/20 text-center"
          delay={0.7}
        >
          <p className="opacity-70">
            © 2025 Fahim Khan. Built with React, TypeScript,
            Tailwind CSS, and Framer Motion.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}