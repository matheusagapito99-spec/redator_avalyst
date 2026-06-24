/** Divide texto em chunks (~1200 chars) com sobreposição, preservando parágrafos. */
export function chunkText(
  text: string,
  opts?: { size?: number; overlap?: number },
): string[] {
  const size = opts?.size ?? 1200;
  const overlap = opts?.overlap ?? 150;

  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    // Parágrafo gigante: corta em pedaços do tamanho do chunk.
    if (para.length > size) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = "";
      }
      for (let i = 0; i < para.length; i += size - overlap) {
        chunks.push(para.slice(i, i + size).trim());
      }
      continue;
    }

    if (current && (current + "\n\n" + para).length > size) {
      chunks.push(current.trim());
      const tail = current.slice(Math.max(0, current.length - overlap));
      current = tail + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.filter((c) => c.length > 0);
}
