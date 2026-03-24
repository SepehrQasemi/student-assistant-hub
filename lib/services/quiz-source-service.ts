import { extractedDocumentRepository, fileRepository, summaryRepository } from "@/lib/repositories";
import { extractKeyConcepts, type ConceptArtifact } from "@/lib/services/concept-extractor";
import { chunkDocumentText, type DocumentChunk } from "@/lib/services/document-chunker";
import { documentIngestionService } from "@/lib/services/document-ingestion-service";
import type { ExtractedDocument, StoredFileRecord, SummarySectionKey } from "@/types/entities";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+(?=[\p{Lu}0-9#*-])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 30);
}

function stripMarkdownDecorators(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/`{1,3}/g, "")
    .trim();
}

function parseSections(text: string) {
  const lines = text.split("\n");
  const sections: Array<{ title: string; content: string; sentences: string[] }> = [];
  let currentTitle = "Document";
  let currentLines: string[] = [];

  function pushCurrentSection() {
    const content = stripMarkdownDecorators(currentLines.join("\n").trim());

    if (!content) {
      return;
    }

    sections.push({
      title: currentTitle,
      content,
      sentences: splitSentences(content),
    });
  }

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);

    if (headingMatch) {
      pushCurrentSection();
      currentTitle = stripMarkdownDecorators(headingMatch[1] ?? "Document");
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  pushCurrentSection();

  return sections.length > 0
    ? sections
    : [
        {
          title: "Document",
          content: stripMarkdownDecorators(text),
          sentences: splitSentences(stripMarkdownDecorators(text)),
        },
      ];
}

async function loadCurrentSummaryHints(fileId: string, sourceFingerprint: string) {
  const hintModes = ["structured_summary", "study_notes"] as const;
  const hints: Array<{ sectionKey: SummarySectionKey; content: string }> = [];

  for (const mode of hintModes) {
    const latestCurrent = (await summaryRepository.listByFileAndMode(fileId, mode)).find((summary) => summary.sourceFingerprint === sourceFingerprint);

    if (!latestCurrent) {
      continue;
    }

    const sections = await summaryRepository.getSections(latestCurrent.id);

    for (const section of sections) {
      if (section.content.trim()) {
        hints.push({
          sectionKey: section.sectionKey,
          content: section.content,
        });
      }
    }
  }

  return hints;
}

async function loadCurrentConcepts(fileId: string, sourceFingerprint: string) {
  const preferredModes = ["key_concepts", "structured_summary", "study_notes", "quick_summary"] as const;

  for (const mode of preferredModes) {
    const latestCurrent = (await summaryRepository.listByFileAndMode(fileId, mode)).find((summary) => summary.sourceFingerprint === sourceFingerprint);

    if (!latestCurrent) {
      continue;
    }

    const concepts = await summaryRepository.getConcepts(latestCurrent.id);

    if (concepts.length > 0) {
      return concepts.map((concept) => ({
        term: concept.term,
        score: concept.score,
        occurrences: concept.occurrences,
      }));
    }
  }

  return [];
}

export interface QuizSourceSection {
  index: number;
  title: string;
  content: string;
  sentences: string[];
}

export interface QuizSourceMaterial {
  file: StoredFileRecord;
  extractedDocument: ExtractedDocument;
  chunks: DocumentChunk[];
  sections: QuizSourceSection[];
  concepts: ConceptArtifact[];
  summaryHints: Array<{ sectionKey: SummarySectionKey; content: string }>;
}

export class QuizSourceService {
  async getSourceMaterial(fileId: string) {
    const file = await fileRepository.getById(fileId);

    if (!file) {
      throw new Error("missing_source_file");
    }

    const extractedDocument = await documentIngestionService.ingestFile(fileId);

    if (extractedDocument.status !== "success" || !extractedDocument.normalizedText.trim()) {
      return {
        file,
        extractedDocument,
        source: null,
      } as const;
    }

    const currentExtraction =
      (await extractedDocumentRepository.findByFileAndFingerprint(file.id, file.contentFingerprint)) ?? extractedDocument;
    const [summaryHints, persistedConcepts] = await Promise.all([
      loadCurrentSummaryHints(file.id, currentExtraction.sourceFingerprint),
      loadCurrentConcepts(file.id, currentExtraction.sourceFingerprint),
    ]);
    const concepts = persistedConcepts.length > 0 ? persistedConcepts : extractKeyConcepts(currentExtraction.normalizedText, 18);
    const sections = parseSections(currentExtraction.normalizedText).map((section, index) => ({
      ...section,
      index,
    }));
    const chunks = chunkDocumentText(currentExtraction.normalizedText);

    return {
      file,
      extractedDocument: currentExtraction,
      source: {
        file,
        extractedDocument: currentExtraction,
        chunks,
        sections,
        concepts,
        summaryHints,
      } satisfies QuizSourceMaterial,
    } as const;
  }

  findSentenceForTerm(source: QuizSourceMaterial, term: string) {
    const matcher = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");

    for (const section of source.sections) {
      const sentence = section.sentences.find((candidate) => matcher.test(candidate));

      if (sentence) {
        return {
          sentence,
          sectionTitle: section.title,
        };
      }
    }

    return null;
  }
}

export const quizSourceService = new QuizSourceService();
