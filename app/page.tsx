import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  FileSearch,
  GitBranch,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers,
    title: "Multi-workspace",
    desc: "Cada cliente é um workspace isolado: base de conhecimento, integrações e pipeline próprios, rodando em paralelo.",
  },
  {
    icon: FileSearch,
    title: "Grounded por conhecimento",
    desc: "RAG sobre a base de cada cliente. Sem fonte, sem afirmação. Toda métrica carrega sua origem.",
  },
  {
    icon: ShieldCheck,
    title: "Governança embutida",
    desc: "Auditoria por checklist, conformidade (LGPD, CDC, Lei do Inquilinato) e revisão humana obrigatória.",
  },
  {
    icon: GitBranch,
    title: "Pipeline editorial",
    desc: "Pauta → briefing → redação por IA → auditoria → rascunho. Kanban e calendário de ponta a ponta.",
  },
  {
    icon: Sparkles,
    title: "IA sob supervisão",
    desc: "A IA produz, o humano aprova. Nunca publica sozinha. Cada geração é rastreável: modelo, fontes, custo.",
  },
  {
    icon: Gauge,
    title: "Escala com controle",
    desc: "Teto de custo por workspace, cache semântico e seleção de modelo por tarefa. Premium por padrão.",
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-6 py-10">
      {/* glow de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-fg font-bold">
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Redator
          </span>
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">
            interno · multi-workspace
          </span>
        </div>
        <Link href="/login">
          <Button variant="secondary" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="animate-fade-up py-20 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Content Operations Platform
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight">
          Conteúdo de especialista,
          <br />
          na velocidade da IA.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-text-secondary">
          Operações de conteúdo, SEO e growth para vários clientes em paralelo —
          com a segurança de um processo auditável. Nunca inventa dado, nunca
          publica sozinho.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/matheusagapito99-spec/redator_avalyst/tree/main/docs"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="ghost" size="lg">
              Ver a documentação
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="animate-fade-up rounded-lg border border-border bg-surface p-5 shadow-xs transition-colors hover:border-border-strong"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-subtle text-accent">
              <f.icon className="h-[18px] w-[18px]" />
            </div>
            <h3 className="text-[15px] font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-[13px] text-text-muted">
        Redator · plataforma interna · primeiro cliente: Avalyst (garantia
        locatícia)
      </footer>
    </main>
  );
}
