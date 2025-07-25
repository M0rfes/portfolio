"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Rocket, Heart, Target, Award } from "lucide-react";

function StatsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { number: "7+", label: "Years Experience", icon: Award, color: "text-[var(--portfolio-primary)]" },
    { number: "20+", label: "Projects Delivered", icon: Rocket, color: "text-[var(--portfolio-secondary)]" },
    { number: "5", label: "Companies", icon: Target, color: "text-[var(--portfolio-accent)]" },
    { number: "40K", label: "AED Monthly Income", icon: Heart, color: "text-[var(--portfolio-success)]" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
          <div className={`text-3xl mb-2 ${stat.color}`}>{stat.number}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StoryCard({ title, children, colorClass }: { title: string, children: React.ReactNode, colorClass: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50"
    >
      <h3 className={`text-2xl mb-4 ${colorClass}`}>{title}</h3>
      {children}
    </motion.div>
  );
}

function CurrentFocus() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="bg-gradient-to-br from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] p-8 rounded-2xl text-white shadow-xl">
        <h3 className="text-2xl mb-6">Current Focus</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[var(--portfolio-accent)] rounded-full mt-2 flex-shrink-0"></div>
            <p>Working at Presight AI developing LLM-powered dashboards and implementing agentic workflows</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[var(--portfolio-success)] rounded-full mt-2 flex-shrink-0"></div>
            <p>Freelancing for Promax Digital and Hurix Digital to maximize income</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[var(--portfolio-warning)] rounded-full mt-2 flex-shrink-0"></div>
            <p>Supporting family while paying off 300K AED personal loan for home in India</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
            <p>Planning for my daughter&apos;s education and building emergency funds</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
          <h4 className="text-lg mb-2">Life Goals</h4>
          <ul className="text-sm space-y-1">
            <li>• Achieve debt-free life</li>
            <li>• Build 1-2 years of emergency funds</li>
            <li>• Retire at 40</li>
            <li>• Travel the world with family</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function CoreValues() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const values = [
    { title: "Hard Work", desc: "Sometimes working 20 hours a day to meet deadlines and support family" },
    { title: "Family First", desc: "Everything I do is to provide better opportunities for my family" },
    { title: "Continuous Learning", desc: "Always exploring new technologies and improving my skills" }
  ];

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mt-16 text-center"
    >
      <motion.h3 
        variants={itemVariants}
        className="text-2xl mb-8 text-[var(--portfolio-primary)]"
      >
        Core Values
      </motion.h3>
      <div className="grid md:grid-cols-3 gap-6">
        {values.map((value, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-lg mb-2 text-[var(--portfolio-primary)]">{value.title}</h4>
            <p className="text-gray-600 text-sm">{value.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SectionTitle() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] bg-clip-text text-transparent">
        My Journey
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        From the slums of Mumbai to leading software engineering teams across the globe
      </p>
    </motion.div>
  );
}

export function About() {
  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-br from-white to-blue-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SectionTitle />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Story Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Story */}
          <div className="space-y-6">
            <StoryCard title="The Beginning" colorClass="text-[var(--portfolio-primary)]">
              <p className="text-gray-700 leading-relaxed mb-4">
                Born and raised in the slums of Bhandup, Sonapur - a suburb of Mumbai. Despite financial challenges, 
                my family always prioritized education. There were times when having 5,000 INR was a big deal, 
                and my father couldn&apos;t afford to pay for my glasses.
              </p>
              <p className="text-gray-700 leading-relaxed">
                My first laptop was a second-hand Dell during my 11th grade. That machine became my gateway 
                to the world of technology and changed everything.
              </p>
            </StoryCard>

            <StoryCard title="The Transformation" colorClass="text-[var(--portfolio-secondary)]">
              <p className="text-gray-700 leading-relaxed mb-4">
                Completed my engineering from Rizvi College in 2020. Started my career and worked my way up 
                through dedication, continuous learning, and an unwavering commitment to excellence.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, I work multiple jobs - sometimes 20 hours a day - to support my growing family 
                and achieve financial stability. Currently earning 40K AED monthly while supporting 
                family back in India.
              </p>
            </StoryCard>
          </div>

          {/* Right Column - Current Focus */}
          <CurrentFocus />
        </div>

        {/* Values */}
        <CoreValues />
      </div>
    </section>
  );
}