function isMarkdownHeading(line: string) {
  return /^#{1,6}\s+\S/.test(line);
}

function isBulletLike(line: string) {
  return /^([-*•]|\d+[.)])\s+/.test(line);
}

function shouldMergeLine(previous: string, next: string) {
  if (!previous || !next) {
    return false;
  }

  if (isMarkdownHeading(previous) || isMarkdownHeading(next) || isBulletLike(next)) {
    return false;
  }

  if (/[.!?:;]$/.test(previous)) {
    return false;
  }

  return true;
}

export function normalizeExtractedText(rawText: string) {
  const normalizedLineEndings = rawText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/(\p{L})-\n(\p{L})/gu, "$1$2");

  const lines = normalizedLineEndings.split("\n").map((line) => line.replace(/[ \t]+$/g, ""));
  const rebuilt: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      if (rebuilt.at(-1) !== "") {
        rebuilt.push("");
      }
      continue;
    }

    const previous = rebuilt.at(-1);

    if (previous && previous !== "" && shouldMergeLine(previous, trimmed)) {
      rebuilt[rebuilt.length - 1] = `${previous} ${trimmed}`.replace(/\s+/g, " ").trim();
      continue;
    }

    rebuilt.push(trimmed.replace(/\s+/g, " "));
  }

  return rebuilt
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
