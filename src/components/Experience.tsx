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
        "Platform engineering for event-driven microservices and LLM agent pipelines (MCP, tool-calling); cross-team coordination with 3 product squads (~15 engineers in a ~40-person eng org) — ops ~25 hrs/week → ~15 hrs/week (40%)",
        "Service ownership for inference APIs (Rust / NestJS) on Docker/Kubernetes: SLOs, on-call, observability — 99.9%+ uptime on ~2M requests/month, MTTR ~45 min → <15 min",
        "Infra automation and architecture reviews for CI/CD / independent deploys across squads — release cycle 10 days → 4 days (60%); WebSockets/WebRTC for 500+ concurrent users per instance",
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
        "Platform engineering: service-discovery redesign (Java→Rust/Axum/Tokio) via architecture reviews with a ~12-person platform/fintech delivery team and bank stakeholders; 6→3 replicas, p99 300ms → <50ms, hosting cost halved",
        "Service ownership of reverse-proxy and traffic routing with event-driven fan-out, queues, and backpressure — 10,000+ concurrent connections at ~5k RPS, stable p99",
        "Infra automation for Playwright/Appium CI; mentoring 4 engineers on SLOs/on-call — 1 incident in six months across ~50 weekly releases; coverage 45% → 90%, regressions -65%",
        "Cross-team coordination with Emirates NBD eng (~8 partner contacts) on interbanking REST/API integrations (12+ endpoints, ~8k daily settlement messages); reconciliation 2 days → same-day",
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
        "Infra automation: RAG / LLM pipeline (GPT-3.5) migrating Selenium→Playwright; mentoring a pod of 3 engineers (~400-test suite) inside a ~25-person Bridgecrest eng org — 12 months → 3 months",
        "Service ownership of Apollo GraphQL federation across loan, payments, and customer microservices (6 services, ~10 service owners) — 35% fewer API round-trips",
        "Platform engineering for AWS CI/CD (GitHub Actions) with automated rollback and observability — daily deploys (~20/month) from weekly; architecture reviews for squad standards",
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
        "Platform engineering / service ownership: Node.js→Rust (Axum) API microservices with PostgreSQL and queue-backed jobs for a ~10-engineer product team — 60% lower server cost (8→3 instances), 10,000+ connections, sub-50ms p99",
        "Cross-team coordination with product and support (~6 stakeholders) on first LLM / GPT-3 RAG 'talk to your docs' rollout (~5k-doc corpus) — tickets ~200/mo → ~150/mo (-25%), onboarding ~30% faster",
        "Infra automation for mobile CI delivery (Ionic/Capacitor) on shared REST/GraphQL APIs — 40% mobile growth from ~2.5k MAU",
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
        "Service ownership of geospatial nearest-clinic (PostGIS + K-d tree) for a ~6-engineer startup — ~1,200 clinics, ~50k queries/day, 10x compute cost reduction; retired a dedicated geo-service",
        "Platform engineering for event-driven notification/booking microservices with durable queues — 2,000+ concurrent bookings, p95 under 200ms (from ~1.2s)",
        "Cross-team coordination of web and mobile delivery from one Ionic/Capacitor codebase (3 platforms, 2 client teams) — 60% less maintenance vs native forks",
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
