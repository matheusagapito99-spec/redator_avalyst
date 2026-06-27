import "server-only";

/** Extrai texto de PDF, DOCX, MD, TXT ou CSV. */
export async function extractText(
  filename: string,
  mime: string | null,
  buffer: Buffer,
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";

  if (ext === "pdf" || mime === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
    const result = await parser.getText();
    // Remove marcadores de página "-- N of M --" do pdf-parse v2.
    return (result.text ?? "").replace(/\n*-- \d+ of \d+ --\n*/g, "\n\n");
  }

  if (
    ext === "docx" ||
    mime?.includes("officedocument.wordprocessingml") === true
  ) {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  // md, txt, csv e demais texto puro
  return buffer.toString("utf8");
}
