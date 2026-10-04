"use client";
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Table2,
  ImagePlus,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Strikethrough,
} from "lucide-react";
import { readImage } from "@/lib/workspace";
export function DocumentEditor({
  html,
  onChange,
  onError,
  register,
}: {
  html: string;
  onChange: (html: string) => void;
  onError: (message: string) => void;
  register: (editor: Editor) => void;
}) {
  const upload = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image.configure({ allowBase64: true }),
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Placeholder.configure({
        placeholder: "Start with an idea. Write your lesson here…",
      }),
    ],
    content: html,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "word-document",
        "aria-label": "Article content",
        role: "textbox",
        "aria-multiline": "true",
      },
      transformPastedHTML: (html) => DOMPurify.sanitize(html),
      handlePaste: (view, event) => {
        const image = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!image) return false;
        event.preventDefault();
        void readImage(image)
          .then((src) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({
                  src,
                  alt: image.name || "Pasted image",
                }),
              ),
            );
            view.focus();
          })
          .catch((e) => onError(e.message));
        return true;
      },
      handleDrop: (view, event) => {
        const image = Array.from(event.dataTransfer?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!image) return false;
        event.preventDefault();
        void readImage(image)
          .then((src) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({
                  src,
                  alt: image.name || "Pasted image",
                }),
              ),
            );
            view.focus();
          })
          .catch((e) => onError(e.message));
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => {
    if (editor) register(editor);
  }, [editor, register]);
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
      underline: editor?.isActive("underline"),
      strike: editor?.isActive("strike"),
      highlight: editor?.isActive("highlight"),
      bullet: editor?.isActive("bulletList"),
      ordered: editor?.isActive("orderedList"),
      quote: editor?.isActive("blockquote"),
      table: editor?.isActive("table"),
      heading: editor?.isActive("heading", { level: 1 })
        ? "1"
        : editor?.isActive("heading", { level: 2 })
          ? "2"
          : editor?.isActive("heading", { level: 3 })
            ? "3"
            : "0",
    }),
  });
  if (!editor)
    return <div className="editor-loading">Preparing your document…</div>;
  const tools = [
    {
      label: "Bold",
      icon: Bold,
      active: state?.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state?.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: state?.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state?.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Highlight",
      icon: Highlighter,
      active: state?.highlight,
      run: () => editor.chain().focus().toggleHighlight().run(),
    },
    {
      label: "Bullet list",
      icon: List,
      active: state?.bullet,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state?.ordered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Block quote",
      icon: Quote,
      active: state?.quote,
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Align left",
      icon: AlignLeft,
      run: () => editor.chain().focus().setTextAlign("left").run(),
    },
    {
      label: "Align center",
      icon: AlignCenter,
      run: () => editor.chain().focus().setTextAlign("center").run(),
    },
    {
      label: "Align right",
      icon: AlignRight,
      run: () => editor.chain().focus().setTextAlign("right").run(),
    },
  ];
  return (
    <div className="document-editor">
      <div
        className="document-toolbar"
        role="toolbar"
        aria-label="Document formatting"
      >
        <select
          aria-label="Text style"
          value={state?.heading ?? "0"}
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: level as 1 | 2 | 3 })
                .run();
          }}
        >
          <option value="0">Normal text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <span className="toolbar-divider" />
        {tools.map((t) => (
          <button
            type="button"
            key={t.label}
            aria-label={t.label}
            title={t.label}
            aria-pressed={t.active ?? false}
            onMouseDown={(e) => e.preventDefault()}
            onClick={t.run}
          >
            <t.icon size={17} />
          </button>
        ))}
        <span className="toolbar-divider" />
        <button
          type="button"
          aria-label="Insert table"
          title="Insert 3-column table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 size={17} />
        </button>
        <button
          type="button"
          aria-label="Insert image"
          title="Insert image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => upload.current?.click()}
        >
          <ImagePlus size={17} />
        </button>
        <button
          type="button"
          aria-label="Horizontal line"
          title="Horizontal line"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={17} />
        </button>
        <button
          type="button"
          aria-label="Undo"
          title="Undo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={17} />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={17} />
        </button>
        <input
          ref={upload}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          aria-label="Inline image file"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file)
              try {
                const src = await readImage(file);
                editor.chain().focus().setImage({ src, alt: file.name }).run();
              } catch (e) {
                onError((e as Error).message);
              }
          }}
        />
      </div>
      {state?.table && (
        <div className="table-toolbar" aria-label="Table controls">
          <button onClick={() => editor.chain().focus().addRowAfter().run()}>
            Add row
          </button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
            Add column
          </button>
          <button onClick={() => editor.chain().focus().deleteRow().run()}>
            Delete row
          </button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()}>
            Delete column
          </button>
          <button onClick={() => editor.chain().focus().deleteTable().run()}>
            Remove table
          </button>
        </div>
      )}
      <div className="document-canvas">
        <EditorContent editor={editor} />
      </div>
      <div className="document-status">
        <span>
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
        </span>
        <span>
          Paste images directly into the document · Ctrl / ⌘ + B for bold
        </span>
      </div>
    </div>
  );
}
