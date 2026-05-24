"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function NoiseOverlay() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]" aria-hidden>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, #08080b 100%)" }} />
    </div>
  );
}

function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full blur-3xl", className)}
      style={style}
      animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FadeIn({
  children,
  delay = 0,
  className,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = { up: { y: 32, x: 0 }, down: { y: -32, x: 0 }, left: { x: 32, y: 0 }, right: { x: -32, y: 0 }, none: { x: 0, y: 0 } };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-dim)] bg-[oklch(0.86_0.18_130_/_0.08)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
      {children}
    </span>
  );
}

function BentoCard({ children, className, glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6", className)}
      style={{
        boxShadow: hovered ? (glow ? "0 0 40px -10px oklch(0.86 0.18 130 / 0.25), 0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.4)") : "0 4px 16px rgba(0,0,0,0.2)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: "radial-gradient(circle at 50% 0%, oklch(0.86 0.18 130 / 0.06), transparent 70%)" }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 40)), [scrollY]);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
      style={{
        background: scrolled ? "rgba(8,8,11,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="TrivyHub logo">
          <rect width="28" height="28" rx="7" fill="oklch(0.86 0.18 130 / 0.15)" />
          <path d="M7 10h14M14 7v14M10 17l4-6 4 6" stroke="oklch(0.86 0.18 130)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-semibold tracking-tight text-[var(--fg)]">TrivyHub</span>
      </div>

      <div className="hidden items-center gap-8 text-sm text-[var(--fg-muted)] md:flex">
        {[["Features", "#features"], ["Install", "#install"], ["How it works", "#how-it-works"]].map(([label, href]) => (
          <a key={label} href={href} className="transition-colors hover:text-[var(--fg)]">{label}</a>
        ))}
      </div>

      <a
        href="https://github.com/trivyhub/trivy-dashboard-web"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--fg-muted)] transition-all hover:border-[var(--border-bright)] hover:text-[var(--fg)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
        GitHub
      </a>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), { stiffness: 40, damping: 30 });
  const orbY = useSpring(useTransform(mouseY, [0, 1], [-20, 20]), { stiffness: 40, damping: 30 });

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX / window.innerWidth); mouseY.set(e.clientY / window.innerHeight); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16" id="hero">
      <GridLines />
      <NoiseOverlay />
      <motion.div style={{ x: orbX, y: orbY }} className="pointer-events-none absolute inset-0">
        <Orb className="h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2" style={{ left: "30%", top: "35%", background: "oklch(0.86 0.18 130 / 0.12)" }} />
        <Orb className="h-[500px] w-[500px]" style={{ right: "10%", top: "20%", background: "oklch(0.68 0.22 285 / 0.10)" }} />
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 inline-flex">
          <Pill>
            <motion.span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            Open source · MIT license
          </Pill>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 text-5xl font-bold leading-[1.06] tracking-[-0.03em] md:text-7xl"
        >
          <span style={{ color: "var(--fg)" }}>Self-hosted</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, oklch(0.86 0.18 130) 0%, oklch(0.78 0.20 160) 50%, oklch(0.68 0.22 285) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Trivy dashboard
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          Aggregate Trivy scan results from your CI/CD pipelines into one real-time dashboard. Docker, Docker Compose, or Kubernetes — your infrastructure, your data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <a
            href="#install"
            className="group relative overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            <span className="relative z-10">Get started</span>
            <motion.div className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20" whileHover={{ translateX: "150%" }} transition={{ duration: 0.5 }} />
          </a>
          <a
            href="https://github.com/trivyhub/trivy-dashboard-web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-medium transition-all hover:text-[var(--fg)]"
            style={{ borderColor: "var(--border-strong)", color: "var(--fg-muted)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex h-10 w-6 items-start justify-center rounded-full border pt-1.5" style={{ borderColor: "var(--border-bright)" }}>
          <div className="h-2 w-1 rounded-full" style={{ background: "var(--fg-dim)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  { label: "Real-time scanning", color: "var(--accent)", title: "CVEs ranked by impact", body: "Triage faster with severity-ordered results and direct fix versions — no noise." },
  { label: "Analytics", color: "var(--sev-high)", title: "Trend analysis", body: "Weekly breakdown of critical and high-severity findings across all your projects." },
  { label: "Integrations", color: "var(--violet)", title: "One-line CI integration", body: "GitHub Actions, GitLab CI, Jenkins — add a single curl call to your pipeline and you're done." },
  { label: "Multi-project", color: "var(--accent)", title: "Projects & environments", body: "Organize scans by project and environment (production, staging) with role-based access." },
  { label: "Scan history", color: "var(--sev-high)", title: "Full scan timeline", body: "CVE evolution chart, diff vs previous scan, branch and commit context for every run." },
  { label: "API Keys", color: "var(--violet)", title: "Secure API access", body: "Create, copy and revoke API keys per project. Integrate from any CI system." },
];

function Features() {
  return (
    <section className="relative overflow-hidden py-24 px-6" id="features">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-16 text-center">
          <Pill>Features</Pill>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--fg)" }}>
            Everything you need<br />
            <span style={{ color: "var(--fg-muted)" }}>to stay ahead of threats</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08} direction="up">
              <BentoCard glow={i === 0} className="h-full">
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: f.color }}>{f.label}</p>
                <h3 className="mt-2 text-xl font-semibold" style={{ color: "var(--fg)" }}>{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>{f.body}</p>
              </BentoCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Install ──────────────────────────────────────────────────────────────────

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-bright)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <span className="font-mono text-xs" style={{ color: "var(--fg-dim)" }}>{label}</span>
        <button onClick={copy} className="text-xs transition-colors" style={{ color: copied ? "var(--accent)" : "var(--fg-dim)" }}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-loose" style={{ color: "var(--fg-muted)" }}>{code}</pre>
    </div>
  );
}

const INSTALL_TABS = [
  {
    id: "docker",
    label: "Docker",
    code: `docker run -d \\
  --name trivyhub \\
  -p 3000:3000 \\
  -e JWT_SECRET=$(openssl rand -hex 32) \\
  -v trivyhub-data:/app/data \\
  ghcr.io/trivyhub/trivy-dashboard-web:latest`,
    note: "SQLite, zero config. Data persisted in a Docker volume.",
  },
  {
    id: "compose",
    label: "Docker Compose",
    code: `# download docker-compose.yml from the repo, then:
JWT_SECRET=$(openssl rand -hex 32) \\
POSTGRES_PASSWORD=$(openssl rand -hex 16) \\
docker compose up -d`,
    note: "PostgreSQL included. Recommended for production.",
  },
  {
    id: "helm",
    label: "Kubernetes / Helm",
    code: `helm install trivyhub oci://ghcr.io/trivyhub/charts/trivy-dashboard-web \\
  --set env.JWT_SECRET=$(openssl rand -hex 32) \\
  --set postgres.password=$(openssl rand -hex 16) \\
  --set ingress.enabled=true \\
  --set ingress.host=trivyhub.your-company.com`,
    note: "PostgreSQL on PVC included. Supports cert-manager TLS.",
  },
];

function Install() {
  const [tab, setTab] = useState("docker");
  const active = INSTALL_TABS.find((t) => t.id === tab)!;

  return (
    <section className="relative overflow-hidden border-t py-24 px-6" style={{ borderColor: "var(--border)" }} id="install">
      <Orb className="h-[600px] w-[600px] -translate-x-1/2" style={{ left: "80%", top: "50%", background: "oklch(0.68 0.22 285 / 0.07)" }} />
      <div className="relative mx-auto max-w-3xl">
        <FadeIn className="mb-12 text-center">
          <Pill>Install</Pill>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--fg)" }}>
            Up and running<br />
            <span style={{ color: "var(--fg-muted)" }}>in under five minutes</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-4 flex gap-2">
            {INSTALL_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all"
                style={{
                  borderColor: tab === t.id ? "var(--accent-dim)" : "var(--border-strong)",
                  color: tab === t.id ? "var(--accent)" : "var(--fg-muted)",
                  background: tab === t.id ? "oklch(0.86 0.18 130 / 0.08)" : "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <CodeBlock label={active.label} code={active.code} />
          <p className="mt-3 text-sm" style={{ color: "var(--fg-dim)" }}>{active.note}</p>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-16">
          <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--fg)" }}>Push scan results from CI</h3>
          <CodeBlock
            label=".github/workflows/scan.yml"
            code={`- name: Trivy scan
  run: trivy image --format json --output report.json $IMAGE

- name: Push to TrivyHub
  run: |
    curl -X POST \\
      -H "Authorization: Bearer \${{ secrets.TRIVYHUB_TOKEN }}" \\
      -F "project=\${{ github.repository }}" \\
      -F "file=@report.json" \\
      -F "environment=production" \\
      -F "branch=\${{ github.ref_name }}" \\
      -F "commit=\${{ github.sha }}" \\
      https://trivyhub.your-company.com/api/v1/report`}
          />
        </FadeIn>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "Deploy TrivyHub", body: "Run it with Docker, Docker Compose, or Helm. Choose SQLite for simplicity or PostgreSQL for production." },
  { n: "02", title: "Create an API key", body: "In the dashboard: Settings → API Keys → New key. One key per project or environment." },
  { n: "03", title: "Add to your pipeline", body: "One curl command in your CI job. Trivy scans the image and sends the JSON report to TrivyHub." },
  { n: "04", title: "Monitor & triage", body: "Your team sees CVEs ranked by severity, with fix versions, evolution charts, and full scan history." },
];

function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t py-24 px-6" style={{ borderColor: "var(--border)" }} id="how-it-works">
      <div className="relative mx-auto max-w-5xl">
        <FadeIn className="mb-16 text-center">
          <Pill>How it works</Pill>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl" style={{ color: "var(--fg)" }}>
            Four steps<br />
            <span style={{ color: "var(--fg-muted)" }}>from zero to dashboard</span>
          </h2>
        </FadeIn>
        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-10 left-0 right-0 hidden h-px lg:block" style={{ background: "linear-gradient(90deg, transparent, var(--border-bright) 20%, var(--border-bright) 80%, transparent)" }} />
          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.12} direction="up">
              <div className="relative flex flex-col gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border-bright)", background: "var(--surface)" }}>
                  <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: "var(--accent-dim)", background: "var(--bg)", color: "var(--accent)" }}>
                    {i + 1}
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color: "var(--fg-dim)" }}>{step.n}</span>
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--fg)" }}>{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>{step.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="relative overflow-hidden border-t py-32 px-6" style={{ borderColor: "var(--border)" }}>
      <NoiseOverlay />
      <Orb className="h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "50%", background: "oklch(0.86 0.18 130 / 0.07)" }} />
      <div className="relative mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="text-4xl font-bold tracking-tight md:text-6xl" style={{ color: "var(--fg)" }}>
            Ship secure,<br />
            <span style={{ background: "linear-gradient(135deg, oklch(0.86 0.18 130), oklch(0.68 0.22 285))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              every time.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg" style={{ color: "var(--fg-muted)" }}>
            Open source and self-hosted. Your scans never leave your infrastructure.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#install"
              className="rounded-xl px-8 py-4 text-sm font-semibold text-[#0a0a0a] transition-all hover:brightness-110 active:scale-95"
              style={{ background: "var(--accent)" }}
            >
              Deploy now
            </a>
            <a
              href="https://github.com/trivyhub/trivy-dashboard-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border px-8 py-4 text-sm font-medium transition-all hover:text-[var(--fg)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--fg-muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              Star on GitHub
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t px-6 py-10" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: "var(--fg-dim)" }}>
        <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>TrivyHub</span>
        <span>© {new Date().getFullYear()} TrivyHub. Built on <a href="https://trivy.dev" className="hover:text-[var(--fg-muted)]" target="_blank" rel="noopener noreferrer">Trivy OSS</a>. MIT License.</span>
        <a href="https://github.com/trivyhub/trivy-dashboard-web" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--fg-muted)]">GitHub</a>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Install />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
