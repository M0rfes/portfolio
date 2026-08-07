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
      title: "Software Engineer",
      company: "Presight AI",
      location: "Abu Dhabi",
      dates: "Mar 2025 - Present",
      current: true,
      highlights: [
        "Designed event-driven agent pipelines (LLM + MCP + tool-calling) over async job queues — ~40% less manual engineering effort",
        "Owned service SLOs and on-call for inference-facing backends (Rust / NestJS) on Docker/Kubernetes; 99.9%+ production uptime",
        "Decoupled product squads with independent deploy boundaries, cutting release cycle time ~60%; React/Next.js + WebSockets/WebRTC for live inference streams as a secondary client surface",
      ],
      technologies: [
        "Rust",
        "Go",
        "Node.js",
        "NestJS",
        "TypeScript",
        "GraphQL",
        "Docker",
        "Kubernetes",
        "LLMs",
        "MCP",
        "React",
        "Next.js",
      ],
    },
    {
      id: 2,
      title: "Software Engineer",
      company: "D4 Insight",
      location: "Dubai",
      dates: "Apr 2024 - Jan 2025",
      current: false,
      highlights: [
        "Replaced Java service-discovery with Rust (Axum/Tokio) after GC profiling — p99 300ms → sub-50ms, replicas 6 → 3, hosting cost halved",
        "Built a Rust HTTP reverse proxy for 10,000+ concurrent connections with event-driven fan-out, bounded queues, and backpressure",
        "Defined SLOs and on-call playbooks post-migration — one incident in six months; raised automated coverage 45% → 90%",
        "Delivered Emirates NBD interbanking API integrations under PCI-DSS / ISO 27001; Angular only for secure operator dashboards",
      ],
      technologies: [
        "Rust",
        "Axum",
        "Tokio",
        "Node.js",
        "MongoDB",
        "Playwright",
        "Appium",
        "Finacle",
        "Angular",
      ],
    },
    {
      id: 3,
      title: "Software Engineer",
      company: "Egen Solutions Inc",
      location: "Remote",
      dates: "Mar 2023 - Nov 2023",
      current: false,
      highlights: [
        "Productionized a RAG pipeline (GPT-3.5) that generated Playwright tests from Selenium — collapsed a 12-month migration to 3 months",
        "Architected Apollo GraphQL federation across loan, payments, and customer services — ~35% fewer API round-trips; event-driven payment/state handlers",
        "Owned AWS + GitHub Actions release trains with automated rollback; led 3 engineers on standards and delivery",
      ],
      technologies: [
        "TypeScript",
        "NestJS",
        "Apollo GraphQL",
        "AWS",
        "GitHub Actions",
        "Dynatrace",
        "GPT-3.5",
        "Playwright",
        "Angular",
        "Ionic",
      ],
    },
    {
      id: 4,
      title: "Software Engineer",
      company: "Segment Hub Technologies",
      location: "Mumbai",
      dates: "Sep 2020 - Jan 2023",
      current: false,
      highlights: [
        "Replaced a Node.js bottleneck with a Rust (Axum) API layer — ~60% lower server cost, 10,000+ concurrent connections, sub-50ms responses; queue-backed async jobs for heavy workloads",
        "Shipped the company's first GPT-3 'talk to your docs' product surface — ~25% fewer support tickets",
        "Extended the product to Android/iOS via Ionic/Capacitor as a secondary client on the same APIs",
      ],
      technologies: [
        "Rust",
        "Axum",
        "PostgreSQL",
        "NestJS",
        "AWS",
        "GPT-3",
        "Ionic",
        "Capacitor",
      ],
    },
    {
      id: 5,
      title: "Software Engineer",
      company: "Pawzeeble",
      location: "Mumbai",
      dates: "Jan 2018 - Aug 2020",
      current: false,
      highlights: [
        "Redesigned geospatial nearest-clinic from brute-force Postgres to PostGIS + K-d tree — 10x compute cost reduction at full accuracy",
        "Built event-driven notification and booking flows with durable queues under load",
        "Shipped Android, iOS, and web from one Ionic/Capacitor codebase; LaTeX-capable clinical editor as a secondary product surface",
      ],
      technologies: [
        "TypeScript",
        "NestJS",
        "Koa",
        "PostgreSQL",
        "PostGIS",
        "Angular",
        "Ionic",
        "Capacitor",
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
              8+ years building high-performance services, distributed systems,
              and AI/agent tooling
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
