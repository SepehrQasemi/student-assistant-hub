import { generateDistractors } from "@/lib/services/distractor-generator";
import type { QuizCandidate } from "@/lib/services/question-candidate-service";
import type { QuizSourceMaterial } from "@/lib/services/quiz-source-service";
import type { QuizGenerationOptions, QuizQuestion, QuizQuestionType } from "@/types/entities";

function toSeedNumber(value: string) {
  return value.split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

function rotateArray<T>(values: T[], seed: string) {
  if (values.length <= 1) {
    return values;
  }

  const offset = toSeedNumber(seed) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function replaceConcept(sentence: string, target: string, replacement: string) {
  const matcher = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  return sentence.replace(matcher, (matched) => {
    if (matched[0] === matched[0]?.toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }

    return replacement;
  });
}

function buildExplanation(includeExplanations: boolean, candidate: QuizCandidate, detail: string) {
  if (!includeExplanations) {
    return "";
  }

  return `${detail} ${candidate.sourceHint}`.trim();
}

function buildMultipleChoiceQuestion(
  candidate: QuizCandidate,
  source: QuizSourceMaterial,
  includeExplanations: boolean,
  order: number,
) {
  const distractors = generateDistractors(candidate.term, source.concepts);

  if (distractors.length < 3) {
    return null;
  }

  const choices = rotateArray([candidate.term, ...distractors], `${candidate.id}:mcq`);

  return {
    type: "multiple_choice" as const,
    prompt: `Which term best completes this statement?\n${candidate.maskedSentence}`,
    choices,
    correctAnswer: candidate.term,
    explanation: buildExplanation(includeExplanations, candidate, "The source sentence that supports this answer is:"),
    sourceHint: candidate.sourceHint,
    focusTag: candidate.focusTag,
    order,
  };
}

function buildTrueFalseQuestion(
  candidate: QuizCandidate,
  source: QuizSourceMaterial,
  includeExplanations: boolean,
  order: number,
) {
  const distractor = generateDistractors(candidate.term, source.concepts, 1)[0];
  const shouldMutate = Boolean(distractor) && toSeedNumber(candidate.id) % 2 === 0;
  const statement = shouldMutate && distractor ? replaceConcept(candidate.sentence, candidate.term, distractor) : candidate.sentence;
  const correctAnswer = shouldMutate ? "false" : "true";
  const explanation = shouldMutate && distractor
    ? buildExplanation(includeExplanations, candidate, `The statement is false. The document attributes this point to "${candidate.term}", not "${distractor}".`)
    : buildExplanation(includeExplanations, candidate, "The statement is true according to the source sentence:");

  return {
    type: "true_false" as const,
    prompt: statement,
    choices: ["true", "false"],
    correctAnswer,
    explanation,
    sourceHint: candidate.sourceHint,
    focusTag: candidate.focusTag,
    order,
  };
}

function buildQuestionsOfType(
  candidates: QuizCandidate[],
  source: QuizSourceMaterial,
  type: QuizQuestionType,
  includeExplanations: boolean,
) {
  return candidates
    .map((candidate, index) =>
      type === "multiple_choice"
        ? buildMultipleChoiceQuestion(candidate, source, includeExplanations, index)
        : buildTrueFalseQuestion(candidate, source, includeExplanations, index),
    )
    .filter(Boolean) as Array<{
    type: QuizQuestionType;
    prompt: string;
    choices: string[];
    correctAnswer: string;
    explanation: string;
    sourceHint: string;
    focusTag: QuizQuestion["focusTag"];
    order: number;
  }>;
}

function interleaveQuestions<T>(left: T[], right: T[]) {
  const merged: T[] = [];
  const max = Math.max(left.length, right.length);

  for (let index = 0; index < max; index += 1) {
    if (left[index]) {
      merged.push(left[index]!);
    }

    if (right[index]) {
      merged.push(right[index]!);
    }
  }

  return merged;
}

export function generateQuizQuestions(source: QuizSourceMaterial, candidates: QuizCandidate[], options: QuizGenerationOptions) {
  const multipleChoiceQuestions = buildQuestionsOfType(candidates, source, "multiple_choice", options.includeExplanations);
  const trueFalseQuestions = buildQuestionsOfType(candidates, source, "true_false", options.includeExplanations);

  const pool =
    options.mode === "multiple_choice"
      ? multipleChoiceQuestions
      : options.mode === "true_false"
        ? trueFalseQuestions
        : interleaveQuestions(multipleChoiceQuestions, trueFalseQuestions);

  return pool.slice(0, options.questionCount).map((question, order) => ({
    ...question,
    order,
  }));
}
