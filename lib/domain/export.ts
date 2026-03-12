export const PHOTO_GUIDE_MARKER = "[사진 촬영 가이드]";
export const EXPORT_PHOTO_GUIDE_LABEL = "사진 가이드 : ";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function stripMarkdown(value: string): string {
  return value
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`{1,3}/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1");
}

function normalizeGuideLine(line: string): string {
  if (!line.includes(PHOTO_GUIDE_MARKER)) {
    return line;
  }

  const text = line.replace(PHOTO_GUIDE_MARKER, "").replace(/[:\-]/, "").trim();
  return `${EXPORT_PHOTO_GUIDE_LABEL}${text || "매장 분위기와 메뉴가 잘 보이도록 촬영해 주세요."}`;
}

export function sanitizeExportText(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  const stripped = stripMarkdown(stripHtml(normalized));
  const cleanedLines = stripped
    .split("\n")
    .map((line) => normalizeGuideLine(line.trimEnd()))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return cleanedLines.join("\n\n");
}

export function toExportText(payload: { title: string; body: string; faq?: string; cta?: string }): string {
  const blocks = [payload.title.trim(), payload.body.trim()];

  if (payload.faq) {
    blocks.push(payload.faq.trim());
  }

  if (payload.cta) {
    blocks.push(payload.cta.trim());
  }

  return sanitizeExportText(blocks.join("\n\n"));
}
