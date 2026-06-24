import "server-only";

export type SerpResult = {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
};

function strip(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeDdg(href: string): string {
  try {
    const u = href.startsWith("//") ? "https:" + href : href;
    const url = new URL(u);
    const uddg = url.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    return href.startsWith("http") ? href : "";
  } catch {
    return href.startsWith("http") ? href : "";
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Busca a SERP via DuckDuckGo HTML (sem chave). Dados rotulados como OBSERVADO.
 * Retorna ok=false no caminho degradado (sem inventar resultados).
 */
export async function fetchSerp(
  keyword: string,
  limit = 10,
): Promise<{ results: SerpResult[]; ok: boolean }> {
  try {
    const res = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(keyword), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) return { results: [], ok: false };

    const html = await res.text();
    const snippets = [...html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)].map((m) =>
      strip(m[1]),
    );

    const results: SerpResult[] = [];
    const blockRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = blockRe.exec(html)) && results.length < limit) {
      const url = decodeDdg(m[1]);
      const title = strip(m[2]);
      if (!url || !title) {
        i++;
        continue;
      }
      results.push({
        position: results.length + 1,
        title,
        url,
        domain: domainOf(url),
        snippet: snippets[i] ?? "",
      });
      i++;
    }

    return { results, ok: results.length > 0 };
  } catch {
    return { results: [], ok: false };
  }
}
