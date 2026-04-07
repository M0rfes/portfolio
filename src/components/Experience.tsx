"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MapPin, Calendar, Award, TrendingUp } from "lucide-react";

// Type definitions
interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  dates: string;
  current: boolean;
  highlights: string[];
  technologies: string[];
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const cardRef = useRef(null);
  const isCardInView = useInView(cardRef, { once: true, margin: "-50px" });

  const leftItemVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const rightItemVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={isCardInView ? "visible" : "hidden"}
      variants={index % 2 === 0 ? leftItemVariants : rightItemVariants}
      className={`relative flex items-center mb-12 ${
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-white transform md:-translate-x-2 ${
          exp.current
            ? "bg-[var(--portfolio-accent)] animate-pulse"
            : "bg-[var(--portfolio-primary)]"
        } shadow-lg z-10`}
      >
        {exp.current && (
          <div className="absolute inset-0 rounded-full bg-[var(--portfolio-accent)] animate-ping"></div>
        )}
      </div>

      {/* Content */}
      <div
        className={`w-full md:w-5/12 ml-16 md:ml-0 ${
          index % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
        }`}
      >
        <motion.div
          className={`p-6 rounded-2xl shadow-xl border-2 ${
            index === 0
              ? "bg-primary border-primary"
              : index === 1
                ? "bg-secondary border-secondary"
                : index === 2
                  ? "bg-accent border-accent"
                  : index === 3
                    ? "bg-secondary border-secondary"
                    : "bg-primary border-primary"
          } relative overflow-hidden`}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 border border-foreground/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border border-foreground/20 rounded-full"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary-foreground" />
                <h3 className="text-xl font-bold text-primary-foreground">
                  {exp.title}
                </h3>
                {exp.current && (
                  <span className="px-2 py-1 text-xs bg-card text-card-foreground rounded-full font-semibold">
                    Current
                  </span>
                )}
              </div>
              <h4 className="text-lg mb-2 font-bold text-primary-foreground">
                {exp.company}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm text-primary-foreground font-semibold">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {exp.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {exp.dates}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground">
                  Key Achievements
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {exp.highlights.map((highlight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-primary-foreground font-semibold">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div>
              <span className="text-xs mb-2 block font-bold text-primary-foreground">
                Technologies Used
              </span>
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((tech: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-card text-card-foreground rounded-full font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const experiences: Experience[] = [
    {
      id: 1,
      title: "Full Stack Consultant",
      company: "Presight AI",
      location: "Abu Dhabi",
      dates: "Mar 2025 - Present",
      current: true,
      highlights: [
        "Architected a micro frontend system decoupling deployments across product squads, enabling independent shipping without cross-team bottlenecks",
        "Built real-time dashboards using WebSockets and WebRTC to stream live AI inference data with near-zero latency",
        "Implemented agentic workflows using LLMs, MCP, and tool-calling to automate operational tasks and accelerate legacy code migration",
        "Maintained backend services in Rust and NestJS, deployed via Docker and Kubernetes on distributed cloud infrastructure",
      ],
      technologies: [
        "Rust",
        "Node.js",
        "NestJS",
        "React",
        "Next.js",
        "TypeScript",
        "Go",
        "GraphQL",
        "Docker",
        "Kubernetes",
        "LLMs",
        "MCP",
      ],
    },
    {
      id: 2,
      title: "Senior Software Consultant",
      company: "D4 Insight",
      location: "Dubai",
      dates: "Apr 2024 - Jan 2025",
      current: false,
      highlights: [
        "Migrated critical services from Java to Rust, reducing p99 latency from 300ms+ to sub-50ms and cutting infrastructure replicas from 6 to 3, halving hosting costs",
        "Engineered secure financial dashboards and interbanking API integrations for Emirates NBD, adhering to strict banking security and compliance standards",
        "Built an HTTP reverse proxy in Rust (Axum/Tokio) for high-concurrency traffic routing with minimal overhead",
        "Automated API, web UI, and native app testing using Playwright and Appium",
      ],
      technologies: [
        "Rust",
        "Axum",
        "Tokio",
        "Node.js",
        "Angular",
        "MongoDB",
        "Playwright",
        "Appium",
        "Finacle",
      ],
    },
    {
      id: 3,
      title: "Full Stack Engineer",
      company: "Egen Solutions Inc",
      location: "Remote",
      dates: "Mar 2023 - Nov 2023",
      current: false,
      highlights: [
        "Built a RAG pipeline on GPT-3.5 to automatically migrate legacy Selenium E2E tests to Playwright, cutting the projected timeline from 1 year to 3 months",
        "Led a team of 3 engineers: daily code reviews, testing standards, and end-to-end delivery ownership",
        "Architected the Apollo GraphQL federation layer connecting microservices for loan origination, payments, and customer data on the Bridgecrest platform",
        "Managed AWS infrastructure (EC2, S3, API Gateway) and CI/CD pipelines via GitHub Actions for rapid, reliable releases",
      ],
      technologies: [
        "TypeScript",
        "Angular",
        "Apollo GraphQL",
        "NestJS",
        "Ionic",
        "Playwright",
        "AWS",
        "GitHub Actions",
        "GPT-3.5",
      ],
    },
    {
      id: 4,
      title: "Full Stack Engineer",
      company: "Segment Hub Technologies",
      location: "Mumbai",
      dates: "Sep 2020 - Jan 2023",
      current: false,
      highlights: [
        "Shipped one of the company's first LLM integrations: a GPT-3-powered 'talk to your docs' interface enabling natural language querying of internal documentation",
        "Built a high-performance Rust API layer (Axum), significantly reducing server costs while handling concurrent workloads at scale",
        "Developed cross-platform mobile apps with Ionic/Capacitor for Android and iOS, extending the product beyond Slack",
      ],
      technologies: [
        "Rust",
        "Axum",
        "PostgreSQL",
        "NestJS",
        "Ionic",
        "Capacitor",
        "AWS",
        "GPT-3",
      ],
    },
    {
      id: 5,
      title: "Full Stack Engineer",
      company: "Pawzeeble",
      location: "Mumbai",
      dates: "Jan 2018 - Aug 2020",
      current: false,
      highlights: [
        "Optimized the geospatial 'find nearest clinic' feature, cutting infrastructure cost by 10x while maintaining full response accuracy",
        "Built a WYSIWYG editor with full LaTeX support for clinical document authoring and in-browser file import",
        "Delivered cross-platform apps for Android, iOS, and web from a single Ionic/Capacitor codebase",
      ],
      technologies: [
        "Angular",
        "TypeScript",
        "Koa",
        "NestJS",
        "Ionic",
        "Capacitor",
        "PostgreSQL",
      ],
    },
  ];

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
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      id="experience"
      className="py-20 px-4 bg-muted overflow-x-clip"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-6 font-bold text-primary">
              Professional Journey
            </h2>
            <p className="text-xl text-foreground max-w-3xl mx-auto font-medium">
              8+ years of building scalable solutions and leading engineering
              teams
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary transform md:-translate-x-0.5"></div>

            {experiences.map((exp, index) => (
              <ExperienceCard key={exp.id} exp={exp} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
