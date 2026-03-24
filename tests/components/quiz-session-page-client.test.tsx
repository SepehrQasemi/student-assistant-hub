import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { QuizSessionPageClient } from "@/components/quizzes/quiz-session-page-client";
import { documentQuizService } from "@/lib/services/document-quiz-service";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

const replaceMock = vi.fn();
let attemptParam: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(attemptParam ? `attempt=${attemptParam}` : ""),
}));

async function generateQuiz() {
  const [file] = await fileRepository.importMany([
    {
      file: new File(
        [[
          "# Distributed Systems",
          "Distributed systems coordinate services across multiple machines.",
          "Distributed systems tolerate failures and network delays.",
          "",
          "# Replication",
          "Replication improves resilience and replication introduces consistency tradeoffs.",
          "",
          "# Consensus",
          "Consensus algorithms help distributed systems agree on a value.",
          "",
          "# Review",
          "Review replication, consensus, and consistency before the exam.",
        ].join("\n")],
        "distributed-systems.md",
        { type: "text/markdown" },
      ),
      category: "lecture_note",
      courseId: null,
      notes: "",
      tagIds: [],
    },
  ]);

  const generated = await documentQuizService.generateForFile(file!.id, {
    questionCount: 5,
    mode: "multiple_choice",
    focusMode: "balanced",
    includeExplanations: true,
  });

  return {
    file: file!,
    quiz: generated.quiz!,
    questions: generated.questions,
  };
}

describe("QuizSessionPageClient", () => {
  beforeEach(async () => {
    attemptParam = null;
    replaceMock.mockReset();
    await resetDb();
    await settingsRepository.ensure();
    await settingsRepository.update({ language: "en" });
  });

  it("starts a quiz attempt and submits answers", async () => {
    const generated = await generateQuiz();
    renderWithProviders(<QuizSessionPageClient quizId={generated.quiz.id} />);

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Start quiz" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Start quiz" }));

    for (const question of generated.questions) {
      await waitFor(() => {
        expect(screen.getByRole("button", { name: question.correctAnswer })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: question.correctAnswer }));

      if (question !== generated.questions.at(-1)) {
        await user.click(screen.getByRole("button", { name: "Next" }));
      }
    }

    await user.click(screen.getByRole("button", { name: "Submit quiz" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`/quizzes/${generated.quiz.id}\\?attempt=`)));
    });
  });

  it("renders a stored review in French and shows stale warnings", async () => {
    const generated = await generateQuiz();
    const attempt = await documentQuizService.startAttempt(generated.quiz.id);
    const answerMap = Object.fromEntries(generated.questions.map((question) => [question.id, question.correctAnswer]));
    const submitted = await documentQuizService.submitAttempt(generated.quiz.id, attempt.id, answerMap);

    await fileRepository.replaceSource(
      generated.file.id,
      new File(["# Distributed Systems\nUpdated consistency notes."], "distributed-systems.md", { type: "text/markdown" }),
    );
    await settingsRepository.update({ language: "fr" });
    attemptParam = submitted.attempt.id;

    renderWithProviders(<QuizSessionPageClient quizId={generated.quiz.id} />);

    await waitFor(() => {
      expect(screen.getByText("Resultats et revision")).toBeInTheDocument();
      expect(screen.getAllByText("Genere depuis une ancienne version du fichier").length).toBeGreaterThan(0);
      expect(screen.getAllByText((_, element) => element?.textContent?.includes("Votre reponse") ?? false).length).toBeGreaterThan(0);
    });
  });
});
