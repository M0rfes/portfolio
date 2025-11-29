"use client";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
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

function CountUp({
  value,
  suffix = "",
  duration = 2,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest),
  );

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

function SkillCard({ skill }: { skill: Skill }) {
  const formatHours = (hours: number) => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toString();
  };

  return (
    <div className="group p-4 bg-card rounded-lg border border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300">
      {/* Skill Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base text-primary font-semibold">{skill.name}</h4>
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full">
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-sm font-bold text-primary">
            {formatHours(skill.hours)} hrs
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-card-foreground leading-relaxed">
        {skill.description}
      </p>
    </div>
  );
}

function SkillCategory({ category }: { category: SkillCategory }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.6,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const categoryVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={categoryVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-card backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border"
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl bg-primary`}>
          <category.icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl text-primary font-bold">{category.title}</h3>
          <p className="text-muted-foreground text-sm">
            {category.skills
              .reduce((sum: number, skill: Skill) => sum + skill.hours, 0)
              .toLocaleString()}{" "}
            total hours
          </p>
        </div>
      </div>

      {/* Skills Grid - More compact */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {category.skills.map((skill: Skill, skillIndex: number) => (
          <motion.div key={skillIndex} variants={cardVariants}>
            <SkillCard skill={skill} />
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
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl mb-6 font-bold text-primary">
        Technical Expertise
      </h2>
      <p className="text-xl text-foreground max-w-3xl mx-auto mb-8">
        Hours invested in mastering technologies that drive innovation
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const stats = [
    {
      label: "Languages Mastered",
      value: 10,
      suffix: "+",
      color: "text-[var(--portfolio-primary)]",
    },
    {
      label: "Frameworks Used",
      value: 15,
      suffix: "+",
      color: "text-[var(--portfolio-secondary)]",
    },
    {
      label: "Cloud Services",
      value: 20,
      suffix: "+",
      color: "text-[var(--portfolio-accent)]",
    },
    {
      label: "Total Experience",
      value: 25,
      suffix: "k+ hrs",
      color: "text-[var(--portfolio-success)]",
    },
  ];

  // Calculate delay for each stat: stagger delay (0.2s * index) + card animation duration (0.5s)
  const getCountUpDelay = (index: number) => index * 0.2 + 0.5;

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="text-center"
    >
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 bg-card backdrop-blur-sm rounded-xl shadow-lg border border-border"
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
            <div className="text-sm text-muted-foreground">{stat.label}</div>
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
        {
          name: "Rust",
          hours: 2500,
          description: "High-performance systems, HTTP proxies, CLI tools",
        },
        {
          name: "Go",
          hours: 2000,
          description: "Microservices, REST/GraphQL APIs, backend services",
        },
        {
          name: "Node.js",
          hours: 3000,
          description:
            "Backend services, API development, real-time processing",
        },
        {
          name: "TypeScript",
          hours: 3500,
          description: "Type-safe development, large-scale applications",
        },
        {
          name: "NestJS",
          hours: 1800,
          description: "Enterprise applications, scalable architectures",
        },
      ],
    },
    {
      title: "Frontend Technologies",
      icon: Zap,
      color: "from-[var(--portfolio-secondary)] to-[var(--portfolio-accent)]",
      skills: [
        {
          name: "React",
          hours: 3200,
          description: "Component libraries, complex UIs, state management",
        },
        {
          name: "Next.js",
          hours: 1500,
          description: "SSR, SSG, modern web applications",
        },
        {
          name: "Angular",
          hours: 2800,
          description: "Enterprise applications, complex dashboards",
        },
        {
          name: "React Native",
          hours: 1200,
          description: "Cross-platform mobile applications",
        },
        {
          name: "Vue.js",
          hours: 800,
          description: "Progressive web applications",
        },
      ],
    },
    {
      title: "Database & Storage",
      icon: Database,
      color: "from-[var(--portfolio-accent)] to-[var(--portfolio-success)]",
      skills: [
        {
          name: "MongoDB",
          hours: 2200,
          description: "Document databases, aggregation pipelines",
        },
        {
          name: "PostgreSQL",
          hours: 1800,
          description: "Relational databases, complex queries, optimization",
        },
        {
          name: "Neo4j",
          hours: 600,
          description: "Graph databases, relationship modeling",
        },
        {
          name: "DynamoDB",
          hours: 800,
          description: "NoSQL, serverless architectures",
        },
        {
          name: "Redis",
          hours: 1000,
          description: "Caching, session management, pub/sub",
        },
      ],
    },
    {
      title: "Cloud & DevOps",
      icon: Cloud,
      color: "from-[var(--portfolio-success)] to-[var(--portfolio-warning)]",
      skills: [
        {
          name: "AWS",
          hours: 2000,
          description: "EC2, S3, Lambda, RDS, CloudFormation",
        },
        {
          name: "Docker",
          hours: 1500,
          description: "Containerization, microservices deployment",
        },
        {
          name: "Kubernetes",
          hours: 1200,
          description: "Container orchestration, scaling",
        },
        {
          name: "CI/CD",
          hours: 1800,
          description: "Jenkins, GitHub Actions, deployment automation",
        },
        {
          name: "Monitoring",
          hours: 800,
          description: "Dynatrace, CloudWatch, application health",
        },
      ],
    },
    {
      title: "Emerging Technologies",
      icon: Zap,
      color: "from-[var(--portfolio-warning)] to-[var(--portfolio-primary)]",
      skills: [
        {
          name: "LLMs/GenAI",
          hours: 800,
          description: "AI Agents, MCP, Tool calling, prompt engineering",
        },
        {
          name: "Playwright",
          hours: 1200,
          description: "API automation, web UI testing, E2E testing",
        },
        {
          name: "GraphQL",
          hours: 1500,
          description: "Apollo Federation, schema design, optimization",
        },
        {
          name: "Web3/Solidity",
          hours: 600,
          description: "Smart contracts, blockchain development",
        },
        {
          name: "LaTeX",
          hours: 400,
          description: "Document generation, WYSIWYG editors",
        },
      ],
    },
  ];

  return (
    <section id="skills" className="py-20 px-4 bg-muted overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <SectionTitle />

        {/* Summary Stats - Moved to top */}
        <SummaryStats />

        {/* Skills Categories */}
        <div className="space-y-8 mt-12">
          {skillCategories.map((category, categoryIndex) => (
            <SkillCategory key={categoryIndex} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
