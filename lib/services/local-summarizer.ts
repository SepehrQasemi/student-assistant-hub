import { chunkDocumentText } from "@/lib/services/document-chunker";
import { extractKeyConcepts, type ConceptArtifact } from "@/lib/services/concept-extractor";
import type { SummaryMode, SummarySectionKey } from "@/types/entities";

interface SentenceCandidate {
  text: string;
  order: number;
  score: number;
}

export interface GeneratedSummary {
  overview: string;
  sections: Array<{
    sectionKey: SummarySectionKey;
    order: number;
    content: string;
  }>;
  concepts: ConceptArtifact[];
  chunkCount: number;
}

function extractSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ0-9#*-])/u)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 40);
}

function firstSentence(text: string) {
  return extractSentences(text)[0] ?? "";
}

function sentenceHasDetailSignals(sentence: string) {
  return /\d/.test(sentence) || /\b(deadline|exam|important|attention|note|warning|review|revise|date|chapter|section)\b/i.test(sentence);
}

function scoreSentences(text: string, concepts: ConceptArtifact[]) {
  const sentences = extractSentences(text);
  const conceptTerms = concepts.map((concept) => concept.term.toLowerCase());

  return sentences
    .map((sentence, order) => {
      const lower = sentence.toLowerCase();
      const conceptHits = conceptTerms.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);
      const positionWeight = Math.max(0.2, 1 - order * 0.08);
      const detailWeight = sentenceHasDetailSignals(sentence) ? 0.75 : 0;
      const lengthPenalty = sentence.length > 280 ? -0.25 : 0;

      return {
        text: sentence,
        order,
        score: conceptHits * 1.2 + positionWeight + detailWeight + lengthPenalty,
      } satisfies SentenceCandidate;
    })
    .sort((left, right) => right.score - left.score || left.order - right.order);
}

function topSentences(text: string, concepts: ConceptArtifact[], count: number) {
  return scoreSentences(text, concepts)
    .slice(0, count)
    .sort((left, right) => left.order - right.order)
    .map((sentence) => sentence.text);
}

function collectHeadings(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+\S/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, ""))
    .slice(0, 6);
}

function toBulletBlock(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function generateLocalSummary(text: string, mode: SummaryMode): GeneratedSummary {
  const chunks = chunkDocumentText(text);
  const concepts = extractKeyConcepts(text);
  const headings = collectHeadings(text);
  const overviewSentences =
    mode === "quick_summary"
      ? uniqueStrings([firstSentence(text), ...topSentences(text, concepts, 3)]).slice(0, 3)
      : topSentences(text, concepts, 2);
  const overview = overviewSentences.join(" ");

  if (mode === "quick_summary") {
    return {
      overview,
      sections: [
        {
          sectionKey: "overview",
          order: 0,
          content: overview || text.slice(0, 280),
        },
      ],
      concepts,
      chunkCount: chunks.length,
    };
  }

  if (mode === "structured_summary") {
    const mainTopics = uniqueStrings(headings.length > 0 ? headings : concepts.slice(0, 5).map((concept) => concept.term));
    const keyIdeas = topSentences(text, concepts, 4);
    const importantDetails = uniqueStrings(
      scoreSentences(text, concepts)
        .filter((sentence) => sentenceHasDetailSignals(sentence.text))
        .slice(0, 4)
        .map((sentence) => sentence.text),
    );

    return {
      overview,
      sections: [
        { sectionKey: "mainTopics", order: 0, content: toBulletBlock(mainTopics) },
        { sectionKey: "keyIdeas", order: 1, content: toBulletBlock(keyIdeas) },
        { sectionKey: "importantDetails", order: 2, content: toBulletBlock(importantDetails.length > 0 ? importantDetails : keyIdeas.slice(0, 2)) },
      ],
      concepts,
      chunkCount: chunks.length,
    };
  }

  if (mode === "study_notes") {
    const reviewFirst = uniqueStrings(headings.length > 0 ? headings : concepts.slice(0, 4).map((concept) => concept.term));
    const watchFor = uniqueStrings(
      scoreSentences(text, concepts)
        .filter((sentence) => sentenceHasDetailSignals(sentence.text))
        .slice(0, 3)
        .map((sentence) => sentence.text),
    );

    return {
      overview,
      sections: [
        { sectionKey: "overview", order: 0, content: overview || text.slice(0, 280) },
        { sectionKey: "reviewFirst", order: 1, content: toBulletBlock(reviewFirst) },
        {
          sectionKey: "watchFor",
          order: 2,
          content: toBulletBlock(watchFor.length > 0 ? watchFor : topSentences(text, concepts, 2)),
        },
      ],
      concepts,
      chunkCount: chunks.length,
    };
  }

  const topConcepts = concepts.slice(0, 8);

  return {
    overview: topConcepts.map((concept) => concept.term).join(", "),
    sections: [
      {
        sectionKey: "concepts",
        order: 0,
        content: toBulletBlock(topConcepts.map((concept) => `${concept.term} (${concept.occurrences})`)),
      },
    ],
    concepts: topConcepts,
    chunkCount: chunks.length,
  };
}
