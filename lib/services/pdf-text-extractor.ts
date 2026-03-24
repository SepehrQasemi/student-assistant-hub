let workerConfigured = false;

async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!workerConfigured && typeof Worker !== "undefined" && !pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(
      new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url),
      { type: "module" },
    );
    workerConfigured = true;
  }

  return pdfjs;
}

function collectPageLines(items: Array<{ str?: string; transform?: number[] }>) {
  const lines: string[] = [];
  let currentY: number | null = null;
  let currentWords: string[] = [];

  for (const item of items) {
    const text = item.str?.trim();

    if (!text) {
      continue;
    }

    const y = Math.round(item.transform?.[5] ?? 0);

    if (currentY === null || Math.abs(currentY - y) <= 2) {
      currentWords.push(text);
      currentY = y;
      continue;
    }

    lines.push(currentWords.join(" ").replace(/\s+/g, " ").trim());
    currentWords = [text];
    currentY = y;
  }

  if (currentWords.length > 0) {
    lines.push(currentWords.join(" ").replace(/\s+/g, " ").trim());
  }

  return lines.filter(Boolean);
}

export async function extractTextFromPdf(data: ArrayBuffer) {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    isEvalSupported: false,
    verbosity: 0,
  });

  const document = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{ str?: string; transform?: number[] }>;
      const lines = collectPageLines(items);

      if (lines.length > 0) {
        pages.push(`Page ${pageNumber}\n${lines.join("\n")}`);
      }
    }
  } finally {
    await document.destroy();
  }

  return pages.join("\n\n").trim();
}
