"use client";
import { LIMITS } from "./engine/options";

export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".markdown", ".docx"];

/**
 * Read a document entirely in the browser — the file is never uploaded.
 * Plain text and Markdown are read as UTF-8; .docx is converted to plain text
 * with mammoth (loaded on demand).
 */
export async function importFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf("."));
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type. Use ${ACCEPTED_EXTENSIONS.join(", ")}.`);
  }
  if (file.size > LIMITS.maxFileBytes) {
    throw new Error(`File is too large (max ${LIMITS.maxFileBytes / 1024 / 1024} MB).`);
  }
  if (ext === ".docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return tidy(value);
  }
  const text = await file.text();
  if (/\u0000/.test(text.slice(0, 2000))) throw new Error("This doesn't look like a text file.");
  return tidy(text);
}

function tidy(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
