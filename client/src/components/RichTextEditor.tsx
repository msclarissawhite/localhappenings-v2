import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number; // Hard limit (default 5000)
  softLimit?: number; // Soft limit for warnings (default 2000)
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Enter event description...",
  maxLength = 5000,
  softLimit = 2000,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const charCount = text.length;
      
      // Enforce hard limit
      if (charCount > maxLength) {
        // Prevent further input by reverting to previous state
        return;
      }
      
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive("link") ? "bg-muted" : ""}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
      
      {/* Character Counter */}
      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <CharacterCount 
          current={editor.getText().length} 
          softLimit={softLimit}
          maxLength={maxLength}
        />
      </div>
    </div>
  );
}

function CharacterCount({ current, softLimit, maxLength }: { current: number; softLimit: number; maxLength: number }) {
  const getColorClass = () => {
    if (current >= maxLength) return "text-destructive font-semibold";
    if (current >= softLimit) return "text-orange-600 dark:text-orange-400 font-medium";
    if (current >= softLimit * 0.9) return "text-yellow-600 dark:text-yellow-400";
    return "text-muted-foreground";
  };

  const getMessage = () => {
    if (current >= maxLength) {
      return `${current.toLocaleString()} / ${maxLength.toLocaleString()} characters (maximum reached)`;
    }
    if (current >= softLimit) {
      const remaining = maxLength - current;
      return `${current.toLocaleString()} / ${softLimit.toLocaleString()} characters (${remaining.toLocaleString()} remaining before hard limit)`;
    }
    return `${current.toLocaleString()} / ${softLimit.toLocaleString()} characters`;
  };

  return (
    <p className={`text-sm ${getColorClass()}`}>
      {getMessage()}
    </p>
  );
}
