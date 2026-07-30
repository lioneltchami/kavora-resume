import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { ResumeData } from "./types";

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN_X = 54;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export function sanitizePackFilename(value: string, fallback = "File"): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\w\s.-]+/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
  return cleaned || fallback;
}

export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${current} ${words[i]}`;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }

  return lines;
}

interface DrawContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  y: number;
}

function ensureSpace(ctx: DrawContext, needed: number): void {
  if (ctx.y - needed >= MARGIN_BOTTOM) return;
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN_TOP;
}

function drawLines(
  ctx: DrawContext,
  lines: string[],
  opts: {
    size: number;
    font?: PDFFont;
    lineHeight?: number;
    color?: ReturnType<typeof rgb>;
    indent?: number;
  },
): void {
  const font = opts.font ?? ctx.font;
  const lineHeight = opts.lineHeight ?? opts.size * 1.35;
  const color = opts.color ?? rgb(0.1, 0.1, 0.1);
  const x = MARGIN_X + (opts.indent ?? 0);

  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    if (line.length > 0) {
      ctx.page.drawText(line, {
        x,
        y: ctx.y - opts.size,
        size: opts.size,
        font,
        color,
        maxWidth: CONTENT_WIDTH - (opts.indent ?? 0),
      });
    }
    ctx.y -= lineHeight;
  }
}

function drawSectionTitle(ctx: DrawContext, title: string): void {
  ensureSpace(ctx, 28);
  ctx.y -= 8;
  drawLines(ctx, [title.toUpperCase()], {
    size: 11,
    font: ctx.bold,
    lineHeight: 16,
    color: rgb(0.12, 0.16, 0.23),
  });
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y + 2 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y + 2 },
    thickness: 1,
    color: rgb(0.12, 0.16, 0.23),
  });
  ctx.y -= 8;
}

export async function buildAtsResumePdf(data: ResumeData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ctx: DrawContext = {
    doc,
    page,
    font,
    bold,
    y: PAGE_HEIGHT - MARGIN_TOP,
  };

  const name = (data.name || "Resume").trim();
  drawLines(ctx, [name.toUpperCase()], {
    size: 18,
    font: bold,
    lineHeight: 24,
    color: rgb(0.12, 0.16, 0.23),
  });

  const contact = [data.location, data.phone, data.email]
    .map((v) => v.trim())
    .filter(Boolean)
    .join(" | ");
  if (contact) {
    drawLines(ctx, wrapText(contact, font, 9, CONTENT_WIDTH), {
      size: 9,
      lineHeight: 12,
      color: rgb(0.25, 0.25, 0.25),
    });
  }

  ctx.y -= 4;
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y },
    thickness: 1.5,
    color: rgb(0.12, 0.16, 0.23),
  });
  ctx.y -= 12;

  if (data.summary.trim()) {
    drawSectionTitle(ctx, "Professional Summary");
    drawLines(ctx, wrapText(data.summary.trim(), font, 10, CONTENT_WIDTH), {
      size: 10,
      lineHeight: 13,
    });
  }

  if (data.skills.length > 0) {
    drawSectionTitle(ctx, "Core Competencies");
    drawLines(ctx, wrapText(data.skills.join(" · "), font, 10, CONTENT_WIDTH), {
      size: 10,
      lineHeight: 13,
    });
  }

  if (data.experience.length > 0) {
    drawSectionTitle(ctx, "Professional Experience");
    for (const job of data.experience) {
      drawLines(ctx, [job.title.trim() || "Role"], {
        size: 11,
        font: bold,
        lineHeight: 14,
      });
      const meta = [
        job.company,
        job.location,
        [job.startDate, job.endDate].filter(Boolean).join(" – "),
      ]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(" | ");
      if (meta) {
        drawLines(ctx, wrapText(meta, font, 9, CONTENT_WIDTH), {
          size: 9,
          lineHeight: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
      }
      for (const bullet of job.bullets.map((b) => b.trim()).filter(Boolean)) {
        const wrapped = wrapText(`• ${bullet}`, font, 10, CONTENT_WIDTH - 8);
        drawLines(ctx, wrapped, {
          size: 10,
          lineHeight: 13,
          indent: 8,
        });
      }
      ctx.y -= 4;
    }
  }

  if (data.education.length > 0) {
    drawSectionTitle(ctx, "Education");
    for (const edu of data.education) {
      const line = [edu.degree, edu.school, edu.location]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(" — ");
      drawLines(ctx, wrapText(line, font, 10, CONTENT_WIDTH), {
        size: 10,
        lineHeight: 13,
      });
    }
  }

  const volunteer = data.volunteer.map((v) => v.trim()).filter(Boolean);
  if (volunteer.length > 0) {
    drawSectionTitle(ctx, "Volunteer Experience");
    for (const item of volunteer) {
      drawLines(ctx, wrapText(item, font, 10, CONTENT_WIDTH), {
        size: 10,
        lineHeight: 13,
      });
    }
  }

  if (data.languages.length > 0) {
    drawSectionTitle(ctx, "Languages");
    for (const lang of data.languages) {
      drawLines(
        ctx,
        wrapText(`${lang.name} — ${lang.level}`, font, 10, CONTENT_WIDTH),
        { size: 10, lineHeight: 13 },
      );
    }
  }

  return doc.save();
}

export async function buildCoverLetterPdf(input: {
  name: string;
  fullLetter: string;
  company?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ctx: DrawContext = {
    doc,
    page,
    font,
    bold,
    y: PAGE_HEIGHT - MARGIN_TOP,
  };

  const heading = input.company?.trim()
    ? `Cover Letter — ${input.company.trim()}`
    : "Cover Letter";
  drawLines(ctx, [heading], {
    size: 14,
    font: bold,
    lineHeight: 20,
    color: rgb(0.12, 0.16, 0.23),
  });
  ctx.y -= 10;

  const paragraphs = input.fullLetter.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const paragraph of paragraphs) {
    const lines = wrapText(paragraph.trim(), font, 11, CONTENT_WIDTH);
    drawLines(ctx, lines, { size: 11, lineHeight: 15 });
    ctx.y -= 10;
  }

  if (!input.fullLetter.trim()) {
    drawLines(ctx, [`Prepared for ${input.name || "candidate"}`], {
      size: 11,
      lineHeight: 15,
    });
  }

  return doc.save();
}

export function buildShareLinkText(url: string): string {
  return [
    "Kavora Apply Pack — share link",
    "",
    url,
    "",
    "Open this link to view the live tailored resume.",
  ].join("\n");
}

export function applyPackFilenames(input: { name: string; company?: string }): {
  zipName: string;
  resumeName: string;
  letterName: string;
  linkName: string;
} {
  const person = sanitizePackFilename(input.name || "Resume", "Resume");
  const company = sanitizePackFilename(input.company || "Role", "Role");
  return {
    zipName: `Apply_Pack_${person}_${company}.zip`,
    resumeName: `${person}_Resume.pdf`,
    letterName: `${person}_Cover_Letter.pdf`,
    linkName: "Share_Link.txt",
  };
}
