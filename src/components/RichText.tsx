import { sanitizeRichHtml } from "@/lib/rich-text";

export function RichText({ html, className }: { html: string; className?: string }) {
  if (!html) {
    return null;
  }
  return (
    <div
      className={className ? `rich-content ${className}` : "rich-content"}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}
