export interface DocumentChunk {
  index: number;
  text: string;
  charCount: number;
}

const DEFAULT_MAX_CHARS = 1800;
const DEFAULT_MIN_CHARS = 500;

function splitIntoParagraphBlocks(text: string) {
  const rawBlocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const blocks: string[] = [];

  for (let index = 0; index < rawBlocks.length; index += 1) {
    const current = rawBlocks[index]!;
    const next = rawBlocks[index + 1];

    if (/^#{1,6}\s+\S/.test(current) && next) {
      blocks.push(`${current}\n${next}`);
      index += 1;
      continue;
    }

    blocks.push(current);
  }

  return blocks;
}

function splitLargeBlock(block: string, maxChars: number) {
  const sentences = block
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ0-9#*-])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    const fragments: string[] = [];

    for (let start = 0; start < block.length; start += maxChars) {
      fragments.push(block.slice(start, start + maxChars).trim());
    }

    return fragments.filter(Boolean);
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length > maxChars && current) {
      chunks.push(current);
      current = sentence;
      continue;
    }

    current = candidate;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export function chunkDocumentText(
  text: string,
  options?: {
    maxChars?: number;
    minChars?: number;
  },
) {
  const maxChars = options?.maxChars ?? DEFAULT_MAX_CHARS;
  const minChars = options?.minChars ?? DEFAULT_MIN_CHARS;
  const blocks = splitIntoParagraphBlocks(text);
  const chunks: DocumentChunk[] = [];
  let current = "";

  function pushChunk(chunkText: string) {
    const trimmed = chunkText.trim();

    if (!trimmed) {
      return;
    }

    chunks.push({
      index: chunks.length,
      text: trimmed,
      charCount: trimmed.length,
    });
  }

  for (const block of blocks) {
    if (block.length > maxChars) {
      if (current) {
        pushChunk(current);
        current = "";
      }

      for (const largePart of splitLargeBlock(block, maxChars)) {
        pushChunk(largePart);
      }
      continue;
    }

    const candidate = current ? `${current}\n\n${block}` : block;

    if (candidate.length > maxChars && current.length >= minChars) {
      pushChunk(current);
      current = block;
      continue;
    }

    current = candidate;
  }

  if (current) {
    pushChunk(current);
  }

  return chunks;
}
