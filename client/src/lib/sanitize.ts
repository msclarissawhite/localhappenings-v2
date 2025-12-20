import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting.
 * 
 * Allowed tags: bold, italic, headings, lists, links, paragraphs
 * Blocked: scripts, iframes, event handlers, and other potentially malicious content
 * 
 * @param html - Raw HTML string from rich text editor
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text formatting
      "b",
      "strong",
      "i",
      "em",
      // Headings
      "h2",
      "h3",
      // Lists
      "ul",
      "ol",
      "li",
      // Links
      "a",
      // Paragraphs and breaks
      "p",
      "br",
    ],
    ALLOWED_ATTR: [
      // Only allow href on links
      "href",
      // Allow class for styling (Tiptap adds classes)
      "class",
    ],
    // Only allow http/https links (block javascript:, data:, etc.)
    ALLOWED_URI_REGEXP: /^(?:(?:https?):)/i,
  });
}
