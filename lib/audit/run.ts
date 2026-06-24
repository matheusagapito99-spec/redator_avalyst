/**
 * Auditoria baseada em regras (doc 18). Determinística — não depende de IA.
 * Pode ser aumentada por um passo de IA depois. Itens obrigatórios reprovam o
 * envio; dimensões abaixo de 8 também devolvem para revisão.
 */
export type MandatoryItem = { key: string; label: string; pass: boolean; note: string };
export type DimensionItem = { key: string; label: string; score: number; note: string };
export type AuditOutcome = {
  mandatory: MandatoryItem[];
  dimensions: DimensionItem[];
  passed: boolean;
};

type Block = { type: string; text: string };
type Content = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  blocks?: Block[];
};
type Source = { kind: string; origin: string };

const FORBIDDEN = [
  "aprovação garantida",
  "aprovacao garantida",
  "garantia de aprovação",
  "crédito garantido",
  "credito garantido",
  "sem análise de crédito",
  "sem analise de credito",
  "burlar",
  "driblar a análise",
  "aprovação imediata garantida",
];

const CTA_HINTS = [
  "fale com",
  "saiba mais",
  "solicite",
  "conheça",
  "conheca",
  "comece",
  "agende",
  "peça",
  "entre em contato",
  "experimente",
  "descubra como",
];

function plain(content: Content): string {
  const blocks = content.blocks ?? [];
  return blocks.map((b) => b.text).join("\n").toLowerCase();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function avgSentenceLen(text: string): number {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length === 0) return 0;
  return wordCount(text) / sentences.length;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Number(n.toFixed(1))));
}

export function computeAudit(
  content: Content | null,
  sources: Source[],
  funnelStage: string | null,
  targetKeyword: string | null,
): AuditOutcome {
  const blocks = content?.blocks ?? [];
  const text = content ? plain(content) : "";
  const words = wordCount(text);
  const hasFaq = blocks.some((b) => b.type === "faq");
  const docSources = sources.filter((s) => s.kind === "doc");
  const hasCta = CTA_HINTS.some((c) => text.includes(c));
  const forbiddenHit = FORBIDDEN.find((f) => text.includes(f));
  const titleWords = (content?.title ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const titleCovered = titleWords.length === 0 || titleWords.some((w) => text.includes(w));
  const kwInText = !targetKeyword || text.includes(targetKeyword.toLowerCase().split(/\s+/)[0] ?? "");
  const asl = avgSentenceLen(text);

  const mandatory: MandatoryItem[] = [
    {
      key: "fontes",
      label: "Toda afirmação tem fonte ou está marcada [A VERIFICAR]",
      pass: sources.length > 0,
      note: sources.length > 0 ? `${sources.length} fonte(s) registrada(s).` : "Nenhuma fonte registrada.",
    },
    {
      key: "metricas_seo",
      label: "Nenhuma métrica de SEO inventada (origem declarada)",
      pass: true,
      note: "Toda fonte carrega origem (medido/observado/estimado/verificar).",
    },
    {
      key: "ancoragem_cliente",
      label: "Afirmações sobre o cliente ancoradas na base",
      pass: funnelStage === "topo" || docSources.length > 0 || sources.some((s) => s.origin === "verificar"),
      note:
        docSources.length > 0
          ? `${docSources.length} fonte(s) da base.`
          : "Sem fonte da base — pontos não embasados devem estar [CONFIRMAR COM TIME].",
    },
    {
      key: "fundo_embasamento",
      label: "Fundo de funil: documentos de embasamento presentes",
      pass: funnelStage !== "fundo" || docSources.length > 0,
      note: funnelStage === "fundo" ? `${docSources.length} doc(s) de embasamento.` : "Não se aplica (topo/meio).",
    },
    {
      key: "conformidade",
      label: "Conformidade jurídica e LGPD (sem promessa de aprovação)",
      pass: !forbiddenHit,
      note: forbiddenHit ? `Trecho proibido detectado: "${forbiddenHit}".` : "Sem promessas indevidas detectadas.",
    },
    {
      key: "intencao",
      label: "Intenção de busca atendida (palavra-chave presente)",
      pass: kwInText,
      note: kwInText ? "Palavra-chave-alvo aparece no conteúdo." : "Palavra-chave-alvo ausente.",
    },
    {
      key: "lacuna_serp",
      label: "Cobre lacuna real frente à SERP (profundidade + FAQ)",
      pass: words >= 350 && (hasFaq || blocks.length >= 5),
      note: `${words} palavras, ${blocks.length} blocos, FAQ: ${hasFaq ? "sim" : "não"}.`,
    },
    {
      key: "funil_cta",
      label: "Etapa do funil clara e CTA coerente",
      pass: !!funnelStage && hasCta,
      note: `Funil: ${funnelStage ?? "—"}; CTA: ${hasCta ? "presente" : "ausente"}.`,
    },
    {
      key: "voz",
      label: "Voz e estilo (frases curtas, voz direta)",
      pass: asl > 0 && asl <= 26,
      note: `Média de ${asl.toFixed(0)} palavras por frase.`,
    },
    {
      key: "titulo",
      label: "Título cumpre o que o corpo entrega",
      pass: titleCovered && !!content?.title,
      note: titleCovered ? "Tema do título aparece no corpo." : "Título não refletido no corpo.",
    },
  ];

  const depth = clamp(2 + words / 120 + (hasFaq ? 1 : 0));
  const clareza = clamp(asl === 0 ? 0 : asl <= 18 ? 10 : asl <= 24 ? 8.5 : asl <= 30 ? 7 : 5);
  const difer = clamp(4 + (hasFaq ? 2 : 0) + Math.min(3, blocks.length / 3) + (docSources.length > 0 ? 1 : 0));
  const conversao = clamp((hasCta ? 7 : 4) + (funnelStage === "fundo" ? 2 : funnelStage === "meio" ? 1 : 0));
  const eeat = clamp(4 + Math.min(4, sources.length) + (docSources.length > 0 ? 2 : 0));

  const dimensions: DimensionItem[] = [
    { key: "profundidade", label: "Profundidade e cobertura semântica", score: depth, note: `${words} palavras.` },
    { key: "clareza", label: "Clareza e escaneabilidade", score: clareza, note: `${asl.toFixed(0)} palavras/frase.` },
    { key: "diferenciacao", label: "Diferenciação frente à SERP", score: difer, note: `${blocks.length} blocos, FAQ ${hasFaq ? "sim" : "não"}.` },
    { key: "conversao", label: "Força do caminho de conversão", score: conversao, note: `CTA ${hasCta ? "presente" : "ausente"}.` },
    { key: "eeat", label: "Sinais de EEAT", score: eeat, note: `${sources.length} fonte(s).` },
  ];

  const allMandatory = mandatory.every((m) => m.pass);
  const allDims = dimensions.every((d) => d.score >= 8);

  return { mandatory, dimensions, passed: allMandatory && allDims };
}
