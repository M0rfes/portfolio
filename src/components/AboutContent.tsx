"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

function StoryCard({
  title,
  children,
  colorClass,
}: {
  title: string;
  children: React.ReactNode;
  colorClass: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-card backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border"
    >
      <h3 className={`text-2xl mb-4 font-bold ${colorClass}`}>{title}</h3>
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
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="bg-primary p-8 rounded-2xl shadow-xl border-2 border-primary">
        <h3 className="text-2xl mb-6 font-bold text-primary-foreground">
          Current Focus
        </h3>

        <div className="space-y-4 mb-6 text-primary-foreground">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
            <p className="font-semibold">
              Working at Presight AI developing LLM-powered dashboards and
              implementing agentic workflows
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
            <p className="font-semibold">
              Learning new technologies and skills to stay up-to-date with
              industry trends
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
            <p className="font-semibold">
              Focused on personal growth and financial independence
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary-foreground rounded-full mt-2 flex-shrink-0"></div>
            <p className="font-semibold">
              Education is still a priority for me and for the next generation
            </p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <h4 className="text-lg mb-2 font-bold text-card-foreground">
            Life Goals
          </h4>
          <ul className="text-sm space-y-1 text-card-foreground font-semibold">
            <li>• Achieve debt-free life</li>
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
        ease: "easeOut" as const,
      },
    },
  };

  const values = [
    {
      title: "Hard Work",
      desc: "Dedication to meeting deadlines and delivering excellence",
    },
    {
      title: "Family First",
      desc: "Everything I do is to provide better opportunities for my family",
    },
    {
      title: "Continuous Learning",
      desc: "Always exploring new technologies and improving my skills",
    },
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
        className="text-2xl mb-8 font-bold text-primary"
      >
        Core Values
      </motion.h3>
      <div className="grid md:grid-cols-3 gap-6">
        {values.map((value, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="p-6 bg-card backdrop-blur-sm rounded-xl shadow-lg border border-border"
            whileHover={{ scale: 1.02 }}
          >
            <h4 className="text-lg mb-2 text-primary font-bold">
              {value.title}
            </h4>
            <p className="text-card-foreground text-sm font-medium">
              {value.desc}
            </p>
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
        ease: "easeOut" as const,
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
        My Journey
      </h2>
      <p className="text-xl text-foreground max-w-3xl mx-auto font-medium">
        From the slums of Mumbai to leading software engineering teams across
        the globe
      </p>
    </motion.div>
  );
}

export function AboutContent() {
  return (
    <section className="py-10 px-4 bg-background overflow-x-clip">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SectionTitle />

        {/* Story Content */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Story */}
          <div className="space-y-6">
            <StoryCard title="The Beginning" colorClass="text-primary">
              <p className="text-foreground leading-relaxed mb-4">
                Born and raised in the slums of Bhandup, Sonapur - a suburb of
                Mumbai. Despite financial challenges, my family always
                prioritized education. There were times when having 5,000 INR
                was a big deal, and my father couldn&apos;t afford to pay for my
                glasses.
              </p>
              <p className="text-foreground leading-relaxed">
                My first laptop was a second-hand Dell during my 11th grade.
                That machine became my gateway to the world of technology and
                changed everything.
              </p>
            </StoryCard>

            <StoryCard title="The Transformation" colorClass="text-secondary">
              <p className="text-foreground leading-relaxed mb-4">
                Completed my engineering from Rizvi College in 2020. Started my
                career and worked my way up through dedication, continuous
                learning, and an unwavering commitment to excellence.
              </p>
              <p className="text-foreground leading-relaxed">
                Today I have a fulfilling full-time job and I am grateful for
                the journey.
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
