import "server-only";

export type LlmResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
};

/** Chama o provedor de IA escolhido (REST). Lança erro com mensagem amigável. */
export async function callProvider(
  provider: string,
  model: string,
  apiKey: string,
  system: string,
  user: string,
  opts?: { maxTokens?: number; temperature?: number },
): Promise<LlmResult> {
  const maxTokens = opts?.maxTokens ?? 4096;
  const temperature = opts?.temperature ?? 0.5;

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(providerError("Gemini", res.status, data?.error?.message));
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    return {
      text,
      inputTokens: data?.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(providerError("Anthropic", res.status, data?.error?.message));
    const text = (data?.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
    return {
      text,
      inputTokens: data?.usage?.input_tokens ?? 0,
      outputTokens: data?.usage?.output_tokens ?? 0,
    };
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(providerError("OpenAI", res.status, data?.error?.message));
    return {
      text: data?.choices?.[0]?.message?.content ?? "",
      inputTokens: data?.usage?.prompt_tokens ?? 0,
      outputTokens: data?.usage?.completion_tokens ?? 0,
    };
  }

  throw new Error(`Provedor de IA desconhecido: ${provider}`);
}

function providerError(name: string, status: number, msg?: string): string {
  if (status === 401 || status === 403) return `${name}: chave inválida ou sem permissão.`;
  if (status === 429) return `${name}: limite de uso atingido (rate limit ou sem créditos).`;
  return `${name} retornou erro ${status}${msg ? `: ${msg}` : ""}.`;
}

/** Estimativa de custo (USD) por execução. Aproximado — rotulado como ESTIMADO na UI. */
export function estimateCost(provider: string, model: string, inTok: number, outTok: number): number {
  // Preços aproximados por 1M tokens (entrada/saída), em USD.
  const table: Record<string, [number, number]> = {
    "gemini-2.0-flash": [0.1, 0.4],
    "gemini-2.5-flash": [0.3, 2.5],
    "gemini-2.5-pro": [1.25, 10],
    "claude-sonnet-4-6": [3, 15],
    "claude-opus-4-8": [15, 75],
    "claude-haiku-4-5-20251001": [1, 5],
    "gpt-4o": [2.5, 10],
    "gpt-4o-mini": [0.15, 0.6],
  };
  const [pin, pout] = table[model] ?? [1, 5];
  return Number(((inTok / 1e6) * pin + (outTok / 1e6) * pout).toFixed(4));
}
