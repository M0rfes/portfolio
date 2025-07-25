"use client";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useEffect } from "react";
import { Clock, Code, Database, Cloud, Zap } from "lucide-react";

// Type definitions
interface Skill {
  name: string;
  hours: number;
  description: string;
}

interface SkillCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  skills: Skill[];
}

function CountUp({ value, suffix = "", duration = 2, delay = 0 }: { value: number, suffix?: string, duration?: number, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const displayValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, motionValue, value, delay]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

function SkillCard({ skill, index }: { skill: Skill, index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${Math.min((skill.hours / 3500) * 100, 100)}%`,
      transition: {
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        delay: 0.3
      }
    }
  };

  const getHourColor = (hours: number) => {
    if (hours >= 3000) return "bg-[var(--portfolio-primary)]";
    if (hours >= 2000) return "bg-[var(--portfolio-secondary)]";
    if (hours >= 1000) return "bg-[var(--portfolio-accent)]";
    return "bg-[var(--portfolio-success)]";
  };

  const formatHours = (hours: number) => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toString();
  };

  return (
    <div
      ref={ref}
      className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Skill Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg text-[var(--portfolio-primary)]">{skill.name}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="w-3 h-3" />
          <span>{formatHours(skill.hours)} hrs</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getHourColor(skill.hours)} rounded-full`}
            variants={progressVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{skill.hours.toLocaleString()} hours</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {skill.description}
      </p>

      {/* Experience Level Badge */}
      <div className="mt-4">
        <span className={`px-3 py-1 text-xs rounded-full ${
          skill.hours >= 3000 ? 'bg-[var(--portfolio-primary)] text-white' :
          skill.hours >= 2000 ? 'bg-[var(--portfolio-secondary)] text-white' :
          skill.hours >= 1000 ? 'bg-[var(--portfolio-accent)] text-white' :
          'bg-[var(--portfolio-success)] text-white'
        }`}>
          {skill.hours >= 3000 ? 'Expert' :
           skill.hours >= 2000 ? 'Advanced' :
           skill.hours >= 1000 ? 'Proficient' :
           'Intermediate'}
        </span>
      </div>
    </div>
  );
}

function SkillCategory({ category, categoryIndex }: { category: SkillCategory, categoryIndex: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const categoryVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={categoryVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50"
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color}`}>
          <category.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl text-[var(--portfolio-primary)]">{category.title}</h3>
          <p className="text-gray-600">
            {category.skills.reduce((sum: number, skill: Skill) => sum + skill.hours, 0).toLocaleString()} total hours
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {category.skills.map((skill: Skill, skillIndex: number) => (
          <motion.div key={skillIndex} variants={cardVariants}>
            <SkillCard skill={skill} index={skillIndex} />
          </motion.div>
        ))}
      </motion.div>
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
        ease: [0.25, 0.46, 0.45, 0.94] as const
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
        Technical Expertise
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        Hours invested in mastering technologies that drive innovation
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        <span>Total: 25,000+ hours of hands-on experience</span>
      </div>
    </motion.div>
  );
}

function SummaryStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const stats = [
    { label: "Languages Mastered", value: 10, suffix: "+", color: "text-[var(--portfolio-primary)]" },
    { label: "Frameworks Used", value: 15, suffix: "+", color: "text-[var(--portfolio-secondary)]" },
    { label: "Cloud Services", value: 20, suffix: "+", color: "text-[var(--portfolio-accent)]" },
    { label: "Total Experience", value: 25, suffix: "k+ hrs", color: "text-[var(--portfolio-success)]" }
  ];

  // Calculate delay for each stat: stagger delay (0.2s * index) + card animation duration (0.5s)
  const getCountUpDelay = (index: number) => (index * 0.2) + 0.5;

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="mt-16 text-center"
    >
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`text-3xl mb-2 ${stat.color}`}>
              <CountUp 
                value={stat.value} 
                suffix={stat.suffix} 
                duration={2} 
                delay={getCountUpDelay(index)}
              />
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function Skills() {
  const skillCategories: SkillCategory[] = [
    {
      title: "Backend Technologies",
      icon: Code,
      color: "from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)]",
      skills: [
        { name: "Rust", hours: 2500, description: "High-performance systems, HTTP proxies, CLI tools" },
        { name: "Go", hours: 2000, description: "Microservices, REST/GraphQL APIs, backend services" },
        { name: "Node.js", hours: 3000, description: "Backend services, API development, real-time processing" },
        { name: "TypeScript", hours: 3500, description: "Type-safe development, large-scale applications" },
        { name: "NestJS", hours: 1800, description: "Enterprise applications, scalable architectures" }
      ]
    },
    {
      title: "Frontend Technologies",
      icon: Zap,
      color: "from-[var(--portfolio-secondary)] to-[var(--portfolio-accent)]",
      skills: [
        { name: "React", hours: 3200, description: "Component libraries, complex UIs, state management" },
        { name: "Next.js", hours: 1500, description: "SSR, SSG, modern web applications" },
        { name: "Angular", hours: 2800, description: "Enterprise applications, complex dashboards" },
        { name: "React Native", hours: 1200, description: "Cross-platform mobile applications" },
        { name: "Vue.js", hours: 800, description: "Progressive web applications" }
      ]
    },
    {
      title: "Database & Storage",
      icon: Database,
      color: "from-[var(--portfolio-accent)] to-[var(--portfolio-success)]",
      skills: [
        { name: "MongoDB", hours: 2200, description: "Document databases, aggregation pipelines" },
        { name: "PostgreSQL", hours: 1800, description: "Relational databases, complex queries, optimization" },
        { name: "Neo4j", hours: 600, description: "Graph databases, relationship modeling" },
        { name: "DynamoDB", hours: 800, description: "NoSQL, serverless architectures" },
        { name: "Redis", hours: 1000, description: "Caching, session management, pub/sub" }
      ]
    },
    {
      title: "Cloud & DevOps",
      icon: Cloud,
      color: "from-[var(--portfolio-success)] to-[var(--portfolio-warning)]",
      skills: [
        { name: "AWS", hours: 2000, description: "EC2, S3, Lambda, RDS, CloudFormation" },
        { name: "Docker", hours: 1500, description: "Containerization, microservices deployment" },
        { name: "Kubernetes", hours: 1200, description: "Container orchestration, scaling" },
        { name: "CI/CD", hours: 1800, description: "Jenkins, GitHub Actions, deployment automation" },
        { name: "Monitoring", hours: 800, description: "Dynatrace, CloudWatch, application health" }
      ]
    },
    {
      title: "Emerging Technologies",
      icon: Zap,
      color: "from-[var(--portfolio-warning)] to-[var(--portfolio-primary)]",
      skills: [
        { name: "LLMs/GenAI", hours: 800, description: "AI Agents, MCP, Tool calling, prompt engineering" },
        { name: "Playwright", hours: 1200, description: "API automation, web UI testing, E2E testing" },
        { name: "GraphQL", hours: 1500, description: "Apollo Federation, schema design, optimization" },
        { name: "Web3/Solidity", hours: 600, description: "Smart contracts, blockchain development" },
        { name: "LaTeX", hours: 400, description: "Document generation, WYSIWYG editors" }
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 px-4 bg-gradient-to-br from-white to-blue-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <SectionTitle />

        {/* Skills Categories */}
        <div className="space-y-12">
          {skillCategories.map((category, categoryIndex) => (
            <SkillCategory key={categoryIndex} category={category} categoryIndex={categoryIndex} />
          ))}
        </div>

        {/* Summary Stats */}
        <SummaryStats />
      </div>
    </section>
  );
}