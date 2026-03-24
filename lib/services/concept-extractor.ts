const stopwords = new Set([
  "about",
  "after",
  "again",
  "against",
  "ainsi",
  "alors",
  "also",
  "among",
  "avec",
  "avoir",
  "been",
  "before",
  "between",
  "both",
  "cette",
  "ceux",
  "chez",
  "dans",
  "debut",
  "depuis",
  "does",
  "done",
  "dont",
  "elle",
  "elles",
  "encore",
  "entre",
  "etait",
  "etre",
  "from",
  "have",
  "into",
  "just",
  "leur",
  "leurs",
  "mais",
  "meme",
  "moins",
  "nous",
  "pour",
  "plus",
  "sans",
  "sera",
  "sont",
  "some",
  "such",
  "sur",
  "than",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "tout",
  "tous",
  "very",
  "vous",
  "were",
  "what",
  "when",
  "which",
  "with",
  "would",
  "your",
  "the",
  "and",
  "for",
  "are",
  "est",
  "les",
  "des",
  "une",
  "dans",
  "que",
  "qui",
  "sur",
  "pas",
  "par",
  "pour",
  "avec",
  "from",
  "into",
  "aux",
  "ces",
  "ses",
  "son",
  "not",
  "but",
  "you",
  "our",
  "out",
  "can",
  "was",
  "has",
  "had",
  "its",
  "dune",
  "dans",
  "comme",
  "être",
  "plus",
  "moins",
  "very",
  "their",
]);

function tokenize(text: string) {
  return Array.from(text.toLowerCase().matchAll(/\p{L}[\p{L}\p{N}'’-]*/gu), (match) => match[0])
    .map((token) => token.replace(/^['’]+|['’]+$/g, ""))
    .filter((token) => token.length >= 3);
}

export interface ConceptArtifact {
  term: string;
  score: number;
  occurrences: number;
}

export function extractKeyConcepts(text: string, limit = 8) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const counts = new Map<string, { score: number; occurrences: number }>();

  function addTerm(term: string, weight = 1) {
    if (!term || stopwords.has(term) || /^\d+$/.test(term)) {
      return;
    }

    const existing = counts.get(term) ?? { score: 0, occurrences: 0 };
    existing.score += weight;
    existing.occurrences += 1;
    counts.set(term, existing);
  }

  for (const line of lines) {
    const tokens = tokenize(line).filter((token) => !stopwords.has(token));
    const lineWeight = /^#{1,6}\s+/.test(line) ? 1.8 : 1;

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index]!;
      addTerm(token, lineWeight);

      const next = tokens[index + 1];
      if (next) {
        addTerm(`${token} ${next}`, lineWeight * 0.75);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([term, value]) => ({
      term,
      score: Number(value.score.toFixed(2)),
      occurrences: value.occurrences,
    }))
    .filter((item) => item.occurrences >= 2 || item.score >= 2.5)
    .sort((left, right) => right.score - left.score || right.occurrences - left.occurrences || left.term.localeCompare(right.term))
    .slice(0, limit);
}
