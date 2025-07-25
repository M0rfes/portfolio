"use client";
import { motion } from "motion/react";
import { ChevronDown, MapPin, Mail, Phone } from "lucide-react";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative px-4 py-20">
      <motion.div 
        className="max-w-6xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main heading */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[var(--portfolio-primary)] via-[var(--portfolio-secondary)] to-[var(--portfolio-accent)] bg-clip-text text-transparent mb-6 animate-gradient">
            FAHIM KHAN
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl md:text-3xl text-[var(--portfolio-primary)] opacity-90 mb-4"
        >
          Senior Software Consultant
        </motion.h2>

        {/* Tagline */}
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-700 opacity-85 max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          Crafting innovative solutions with{" "}
          <span className="text-[var(--portfolio-accent)] opacity-95">Rust</span>,{" "}
          <span className="text-[var(--portfolio-secondary)] opacity-95">Go</span>, and{" "}
          <span className="text-[var(--portfolio-success)] opacity-95">TypeScript</span>
          {" "}• From Mumbai slums to global tech leadership
        </motion.p>

        {/* Quick info cards */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: MapPin, text: "Abu Dhabi, UAE", color: "text-[var(--portfolio-primary)]" },
            { icon: Mail, text: "fahimkhan20148@gmail.com", color: "text-[var(--portfolio-secondary)]" },
            { icon: Phone, text: "+971 507 286 133", color: "text-[var(--portfolio-accent)]" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm text-gray-800 opacity-90">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="#experience"
            className="bg-[var(--portfolio-primary)] text-white px-8 py-4 rounded-full hover:bg-[var(--portfolio-secondary)] transition-colors duration-300 shadow-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            View My Work
          </motion.a>
          <motion.a
            href="#contact"
            className="border-2 border-[var(--portfolio-primary)] text-[var(--portfolio-primary)] px-8 py-4 rounded-full hover:bg-[var(--portfolio-primary)] hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            Get In Touch
          </motion.a>
        </motion.div>

        {/* Floating tech icons */}
        <div className="absolute inset-0 pointer-events-none">
          {["Rust", "Go", "React", "Node.js", "TypeScript"].map((tech, index) => (
            <motion.div
              key={tech}
              className="absolute text-sm font-medium text-gray-500/70 select-none"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index % 2) * 40}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.8,
              }}
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6 text-[var(--portfolio-primary)] opacity-80" />
      </motion.div>
    </section>
  );
}