import Link from "next/link";
import { slugify } from "@/lib/blog";

export function MarkdownContent({ content }: { content: string }) {
  const blocks = toBlocks(content);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 ? "h2" : "h3";
          const className =
            block.level === 2
              ? "pt-6 text-3xl font-semibold tracking-tight text-zinc-100"
              : "pt-3 text-2xl font-semibold tracking-tight text-zinc-100";

          return (
            <Heading key={`${block.text}-${index}`} id={slugify(block.text)} className={className}>
              {block.text}
            </Heading>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2 pl-5 text-zinc-300">
              {block.items.map((item) => (
                <li key={item} className="list-disc leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-base leading-relaxed text-zinc-300">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

function toBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.split(/\r?\n/);
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length as 2 | 3,
        text: heading[2].trim(),
      });
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      continue;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);

    if (listItem) {
      flushParagraph();
      list.push(listItem[1].trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (linkMatch) {
      return (
        <Link
          key={`${part}-${index}`}
          href={linkMatch[2]}
          className="font-medium text-cyan-200 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-100"
        >
          {linkMatch[1]}
        </Link>
      );
    }

    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);

    if (boldMatch) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-zinc-100">
          {boldMatch[1]}
        </strong>
      );
    }

    return part;
  });
}
