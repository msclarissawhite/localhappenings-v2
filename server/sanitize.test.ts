import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../client/src/lib/sanitize";

describe("sanitizeHtml", () => {
  describe("Safe formatting preservation", () => {
    it("should preserve bold text", () => {
      const input = "<b>Bold text</b>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<b>Bold text</b>");
    });

    it("should preserve strong text", () => {
      const input = "<strong>Strong text</strong>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<strong>Strong text</strong>");
    });

    it("should preserve italic text", () => {
      const input = "<i>Italic text</i>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<i>Italic text</i>");
    });

    it("should preserve em text", () => {
      const input = "<em>Emphasized text</em>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<em>Emphasized text</em>");
    });

    it("should preserve headings", () => {
      const input = "<h2>Heading 2</h2><h3>Heading 3</h3>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<h2>Heading 2</h2>");
      expect(output).toContain("<h3>Heading 3</h3>");
    });

    it("should preserve bullet lists", () => {
      const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<ul>");
      expect(output).toContain("<li>Item 1</li>");
      expect(output).toContain("<li>Item 2</li>");
      expect(output).toContain("</ul>");
    });

    it("should preserve numbered lists", () => {
      const input = "<ol><li>First</li><li>Second</li></ol>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<ol>");
      expect(output).toContain("<li>First</li>");
      expect(output).toContain("<li>Second</li>");
      expect(output).toContain("</ol>");
    });

    it("should preserve safe links", () => {
      const input = '<a href="https://example.com">Link text</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('<a href="https://example.com">Link text</a>');
    });

    it("should preserve paragraphs", () => {
      const input = "<p>Paragraph text</p>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<p>Paragraph text</p>");
    });

    it("should preserve complex formatted content", () => {
      const input = `
        <h2>Event Details</h2>
        <p>Join us for a <strong>fun</strong> event!</p>
        <ul>
          <li>Activity 1</li>
          <li>Activity 2</li>
        </ul>
        <p>More info at <a href="https://example.com">our website</a></p>
      `;
      const output = sanitizeHtml(input);
      expect(output).toContain("<h2>Event Details</h2>");
      expect(output).toContain("<strong>fun</strong>");
      expect(output).toContain("<ul>");
      expect(output).toContain("<li>Activity 1</li>");
      expect(output).toContain('<a href="https://example.com">our website</a>');
    });
  });

  describe("XSS attack prevention", () => {
    it("should remove script tags", () => {
      const input = '<p>Safe text</p><script>alert("XSS")</script>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<script>");
      expect(output).not.toContain("alert");
      expect(output).toContain("<p>Safe text</p>");
    });

    it("should remove onclick handlers", () => {
      const input = '<p onclick="alert(\'XSS\')">Click me</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("onclick");
      expect(output).not.toContain("alert");
      expect(output).toContain("<p>Click me</p>");
    });

    it("should remove onerror handlers", () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("onerror");
      expect(output).not.toContain("alert");
      expect(output).not.toContain("<img");
    });

    it("should remove iframe tags", () => {
      const input = '<p>Text</p><iframe src="https://evil.com"></iframe>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<iframe");
      expect(output).toContain("<p>Text</p>");
    });

    it("should remove javascript: protocol links", () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("javascript:");
      expect(output).not.toContain("alert");
      // Link text might be preserved but href should be removed
      expect(output).toContain("Click");
    });

    it("should remove data: protocol links", () => {
      const input = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("data:");
      expect(output).not.toContain("<script>");
    });

    it("should remove style tags", () => {
      const input = '<p>Text</p><style>body { display: none; }</style>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<style>");
      expect(output).toContain("<p>Text</p>");
    });

    it("should remove object and embed tags", () => {
      const input = '<p>Text</p><object data="evil.swf"></object><embed src="evil.swf">';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<object");
      expect(output).not.toContain("<embed");
      expect(output).toContain("<p>Text</p>");
    });

    it("should handle multiple XSS attempts", () => {
      const input = `
        <p>Safe content</p>
        <script>alert('XSS1')</script>
        <img src="x" onerror="alert('XSS2')">
        <a href="javascript:alert('XSS3')">Link</a>
        <iframe src="evil.com"></iframe>
      `;
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<script>");
      expect(output).not.toContain("onerror");
      expect(output).not.toContain("javascript:");
      expect(output).not.toContain("<iframe");
      expect(output).not.toContain("alert");
      expect(output).toContain("<p>Safe content</p>");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string", () => {
      const output = sanitizeHtml("");
      expect(output).toBe("");
    });

    it("should handle plain text without HTML", () => {
      const input = "Just plain text";
      const output = sanitizeHtml(input);
      expect(output).toBe("Just plain text");
    });

    it("should handle malformed HTML", () => {
      const input = "<p>Unclosed paragraph<b>Bold";
      const output = sanitizeHtml(input);
      // DOMPurify should fix malformed HTML
      expect(output).toBeTruthy();
      expect(output).not.toContain("<script>");
    });
  });
});
