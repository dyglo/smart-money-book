import { escapeHTML, validatePDF } from "./workspace";
export async function importPDF(
  file: File,
  onProgress: (s: string) => void,
): Promise<{ html: string; pages: number; images: number; message: string }> {
  await validatePDF(file);
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({
    data: await file.arrayBuffer(),
  });
  let pdf;
  try {
    pdf = await task.promise;
    const total = Math.min(pdf.numPages, 20);
    let html = "";
    let images = 0;
    let textPages = 0;
    for (let n = 1; n <= total; n++) {
      onProgress(`Reading page ${n} of ${total}…`);
      const page = await pdf.getPage(n);
      const text = await page.getTextContent();
      const lines: { text: string; y: number; height: number }[] = [];
      for (const item of text.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = Math.round(item.transform[5]);
        const last = lines.at(-1);
        if (last && Math.abs(last.y - y) < 3) {
          last.text += " " + item.str;
          last.height = Math.max(last.height, item.height);
        } else lines.push({ text: item.str, y, height: item.height });
      }
      if (lines.length) textPages++;
      html += `<h2>Page ${n}</h2>`;
      for (const line of lines) {
        const tag = line.height >= 18 ? "h2" : "p";
        html += `<${tag}>${escapeHTML(line.text)}</${tag}>`;
      }
      const operators = await page.getOperatorList();
      let pageImages = 0;
      const seen = new Set<string>();
      for (let i = 0; i < operators.fnArray.length; i++) {
        if (operators.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
        const key = operators.argsArray[i][0] as string;
        if (seen.has(key) || pageImages >= 6) continue;
        seen.add(key);
        try {
          const image = page.objs.get(key);
          if (!image || image.width * image.height > 4000000) continue;
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          if (image.bitmap) ctx.drawImage(image.bitmap, 0, 0);
          else if (image.data) {
            const pixels = new Uint8ClampedArray(
              image.width * image.height * 4,
            );
            if (image.kind === pdfjs.ImageKind.RGBA_32BPP)
              pixels.set(image.data);
            else if (image.kind === pdfjs.ImageKind.RGB_24BPP) {
              for (let j = 0, k = 0; j < image.data.length; j += 3, k += 4) {
                pixels[k] = image.data[j];
                pixels[k + 1] = image.data[j + 1];
                pixels[k + 2] = image.data[j + 2];
                pixels[k + 3] = 255;
              }
            } else continue;
            ctx.putImageData(
              new ImageData(pixels, image.width, image.height),
              0,
              0,
            );
          } else continue;
          html += `<p><img src="${canvas.toDataURL("image/png")}" alt="Image from PDF page ${n}" /></p>`;
          images++;
          pageImages++;
        } catch {
          /* Unsupported image encodings are handled by the page preview below. */
        }
      }
      if (
        (!lines.length ||
          operators.fnArray.includes(pdfjs.OPS.paintImageXObject)) &&
        pageImages === 0
      ) {
        const viewport = page.getViewport({
          scale: Math.min(1.4, 900 / page.getViewport({ scale: 1 }).width),
        });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          html += `<p><img src="${canvas.toDataURL("image/jpeg", 0.8)}" alt="PDF page ${n} illustration" /></p>`;
          images++;
        }
      }
      page.cleanup();
    }
    return {
      html,
      pages: total,
      images,
      message: `Imported ${total} page${total === 1 ? "" : "s"} and ${images} image${images === 1 ? "" : "s"}.${pdf.numPages > 20 ? " Only the first 20 pages were imported." : ""} ${textPages === 0 ? "This PDF is scanned: pages were added as images. OCR is needed for editable text." : "Review headings, reading order, and image placement before publishing."}`,
    };
  } finally {
    await task.destroy();
  }
}
