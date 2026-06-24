/** Metadados de provedores de IA — client-safe (usado no seletor da UI). */
export type ProviderId = "gemini" | "anthropic" | "openai";

export type ProviderMeta = {
  id: ProviderId;
  label: string;
  models: { id: string; label: string }[];
  keyPrefix: string;
  keyUrl: string;
  note?: string;
};

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (rápido · tier grátis)" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (qualidade)" },
    ],
    keyPrefix: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey",
    note: "Tem tier gratuito. No grátis, dados podem ser usados para treino.",
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    models: [
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (equilíbrio)" },
      { id: "claude-opus-4-8", label: "Claude Opus 4.8 (máxima qualidade)" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (econômico)" },
    ],
    keyPrefix: "sk-ant-…",
    keyUrl: "https://platform.claude.com/settings/keys",
    note: "Exige créditos comprados (sem tier grátis na API).",
  },
  {
    id: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini (econômico)" },
    ],
    keyPrefix: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys",
    note: "Exige créditos comprados.",
  },
];

export function getProvider(id: string): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
