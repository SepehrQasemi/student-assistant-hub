import type { ConceptArtifact } from "@/lib/services/concept-extractor";

function normalizeTerm(value: string) {
  return value.trim().toLowerCase();
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function generateDistractors(
  correctAnswer: string,
  concepts: ConceptArtifact[],
  limit = 3,
) {
  const correct = normalizeTerm(correctAnswer);

  return concepts
    .filter((concept) => {
      const normalized = normalizeTerm(concept.term);
      return normalized !== correct && !normalized.includes(correct) && !correct.includes(normalized);
    })
    .map((concept) => ({
      ...concept,
      rank:
        Math.abs(concept.term.length - correctAnswer.length) +
        Math.abs(wordCount(concept.term) - wordCount(correctAnswer)) * 0.5 -
        concept.score * 0.1,
    }))
    .sort((left, right) => left.rank - right.rank || right.score - left.score || left.term.localeCompare(right.term))
    .slice(0, limit)
    .map((concept) => concept.term);
}
