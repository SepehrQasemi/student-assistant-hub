import type { QuizFocusMode, QuizQuestionFocusTag } from "@/types/entities";

import type { QuizSourceMaterial } from "@/lib/services/quiz-source-service";

const definitionPatterns = [
  /\b(is|are|refers to|means|describes|allows|improves|requires|supports|ensures|uses)\b/i,
  /\b(est|sont|designe|signifie|permet|ameliore|necessite|utilise|soutient|assure)\b/i,
];

const reviewPatterns = [/\b(review|revise|revision|exam|important|must|should|key)\b/i, /\b(reviser|revision|examen|important|doit|devrait|cle)\b/i];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countHintMentions(text: string, hints: QuizSourceMaterial["summaryHints"]) {
  const lowered = text.toLowerCase();
  let mentions = 0;

  for (const hint of hints) {
    if (hint.content.toLowerCase().includes(lowered) || lowered.includes(hint.content.toLowerCase().slice(0, 24))) {
      mentions += 1;
    }
  }

  return mentions;
}

function resolveFocusTag(sentence: string, sectionTitle: string, hintScore: number): QuizQuestionFocusTag {
  if (reviewPatterns.some((pattern) => pattern.test(sentence)) || reviewPatterns.some((pattern) => pattern.test(sectionTitle)) || hintScore > 0) {
    return "review";
  }

  if (definitionPatterns.some((pattern) => pattern.test(sentence))) {
    return "key_concepts";
  }

  return "balanced";
}

function computeCandidateScore({
  sentence,
  sectionTitle,
  term,
  conceptScore,
  hintScore,
  focusMode,
}: {
  sentence: string;
  sectionTitle: string;
  term: string;
  conceptScore: number;
  hintScore: number;
  focusMode: QuizFocusMode;
}) {
  let score = conceptScore * 4;

  if (definitionPatterns.some((pattern) => pattern.test(sentence))) {
    score += 2.5;
  }

  if (reviewPatterns.some((pattern) => pattern.test(sentence)) || reviewPatterns.some((pattern) => pattern.test(sectionTitle))) {
    score += 2;
  }

  if (sentence.toLowerCase().startsWith(term.toLowerCase())) {
    score += 1.5;
  }

  if (sectionTitle.toLowerCase().includes(term.toLowerCase())) {
    score += 1.5;
  }

  score += hintScore * 1.5;
  score += Math.max(0, 220 - sentence.length) / 220;

  if (focusMode === "key_concepts") {
    score += conceptScore * 1.4;
  }

  if (focusMode === "review" && reviewPatterns.some((pattern) => pattern.test(sentence))) {
    score += 3;
  }

  if (focusMode === "balanced") {
    score += 0.5;
  }

  return Number(score.toFixed(2));
}

export interface QuizCandidate {
  id: string;
  term: string;
  sentence: string;
  maskedSentence: string;
  sectionTitle: string;
  sourceHint: string;
  focusTag: QuizQuestionFocusTag;
  score: number;
}

export function buildQuestionCandidates(source: QuizSourceMaterial, focusMode: QuizFocusMode) {
  const candidates: QuizCandidate[] = [];
  const seen = new Set<string>();

  for (const concept of source.concepts) {
    const matcher = new RegExp(`\\b${escapeRegExp(concept.term)}\\b`, "i");

    for (const section of source.sections) {
      for (const sentence of section.sentences) {
        if (!matcher.test(sentence)) {
          continue;
        }

        const id = `${concept.term.toLowerCase()}::${sentence.toLowerCase()}`;

        if (seen.has(id)) {
          continue;
        }

        const hintScore = countHintMentions(concept.term, source.summaryHints);
        const focusTag = resolveFocusTag(sentence, section.title, hintScore);
        const score = computeCandidateScore({
          sentence,
          sectionTitle: section.title,
          term: concept.term,
          conceptScore: concept.score,
          hintScore,
          focusMode,
        });

        candidates.push({
          id,
          term: concept.term,
          sentence,
          maskedSentence: sentence.replace(matcher, "_____"),
          sectionTitle: section.title,
          sourceHint: `${section.title}: ${sentence}`,
          focusTag,
          score,
        });
        seen.add(id);
      }
    }
  }

  return candidates.sort((left, right) => right.score - left.score || left.term.localeCompare(right.term) || left.sentence.localeCompare(right.sentence));
}
