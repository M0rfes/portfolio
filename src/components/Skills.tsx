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
      title: "Languages & Systems",
      icon: Code,
      color: "from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)]",
      skills: [
        {
          name: "Rust",
          hours: 2500,
          description: "High-performance services, reverse proxies, concurrency",
        },
        {
          name: "Go",
          hours: 2000,
          description: "Microservices, APIs, backend services",
        },
        {
          name: "TypeScript",
          hours: 3500,
          description: "Type-safe services and large-scale application code",
        },
        {
          name: "Node.js",
          hours: 3000,
          description: "Backend services, APIs, real-time processing",
        },
        {
          name: "NestJS",
          hours: 1800,
          description: "Enterprise services, modular architectures",
        },
      ],
    },
    {
      title: "Distributed Systems",
      icon: Zap,
      color: "from-[var(--portfolio-secondary)] to-[var(--portfolio-accent)]",
      skills: [
        {
          name: "System Design",
          hours: 2000,
          description: "Service boundaries, scalability, failure modes, trade-offs",
        },
        {
          name: "Architecture",
          hours: 1800,
          description: "End-to-end service and platform architecture ownership",
        },
        {
          name: "Event-Driven / Queues",
          hours: 1600,
          description: "Async jobs, backpressure, fan-out, durable workflows",
        },
        {
          name: "GraphQL",
          hours: 1500,
          description: "Apollo Federation, schema design, service boundaries",
        },
        {
          name: "SLOs / On-Call",
          hours: 900,
          description: "Reliability ownership, incident response, uptime targets",
        },
      ],
    },
    {
      title: "Data & Storage",
      icon: Database,
      color: "from-[var(--portfolio-accent)] to-[var(--portfolio-success)]",
      skills: [
        {
          name: "PostgreSQL",
          hours: 1800,
          description: "Relational design, PostGIS, query optimization",
        },
        {
          name: "MongoDB",
          hours: 2200,
          description: "Document stores, aggregation pipelines",
        },
        {
          name: "Neo4j",
          hours: 600,
          description: "Graph databases, relationship modeling",
        },
        {
          name: "Redis",
          hours: 1000,
          description: "Caching, queues, pub/sub, session state",
        },
        {
          name: "DynamoDB",
          hours: 800,
          description: "NoSQL, serverless data access patterns",
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
          description: "EC2, S3, API Gateway, Lambda, RDS",
        },
        {
          name: "Docker",
          hours: 1500,
          description: "Containerization, service packaging",
        },
        {
          name: "Kubernetes",
          hours: 1200,
          description: "Orchestration, scaling, production deploys",
        },
        {
          name: "CI/CD",
          hours: 1800,
          description: "GitHub Actions, release trains, automated rollback",
        },
        {
          name: "Monitoring",
          hours: 800,
          description: "Dynatrace, CloudWatch, application health",
        },
      ],
    },
    {
      title: "AI & Product Surfaces",
      icon: Zap,
      color: "from-[var(--portfolio-warning)] to-[var(--portfolio-primary)]",
      skills: [
        {
          name: "LLMs / Agents",
          hours: 800,
          description: "RAG, MCP, tool-calling, agentic workflows",
        },
        {
          name: "Playwright",
          hours: 1200,
          description: "API/UI automation, E2E reliability gates",
        },
        {
          name: "React / Next.js",
          hours: 3200,
          description: "Secondary product UIs when a client surface is needed",
        },
        {
          name: "Angular",
          hours: 2800,
          description: "Enterprise operator dashboards (fintech)",
        },
        {
          name: "Ionic / Capacitor",
          hours: 1200,
          description: "Cross-platform clients on shared APIs",
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
