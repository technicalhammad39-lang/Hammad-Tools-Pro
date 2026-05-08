'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Type, Underline } from 'lucide-react';
import { normalizeBlogEditorUrl, sanitizeBlogHref } from '@/lib/blog-links';
import {
  getRichTextLength,
  normalizeRichTextValue,
} from '@/lib/rich-text';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
};

const EMPTY_EDITOR_HTML = '<p><br /></p>';

const colorOptions = [
  { label: 'White', value: '#F5F5F5', swatchClassName: 'bg-white' },
  { label: 'Yellow', value: '#FFD600', swatchClassName: 'bg-primary' },
  { label: 'Grey', value: '#8E8E8E', swatchClassName: 'bg-[#8E8E8E]' },
] as const;

const sizeOptions = [
  { label: 'S', value: '2', title: 'Small text' },
  { label: 'M', value: '3', title: 'Medium text' },
  { label: 'L', value: '5', title: 'Large text' },
] as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function selectionBelongsToEditor(editor: HTMLDivElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer);
}

function moveCaretToEnd(editor: HTMLDivElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = '',
  maxLength,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastSentValueRef = useRef('');
  const normalizedValue = useMemo(() => normalizeRichTextValue(value), [value]);
  const plainLength = useMemo(() => getRichTextLength(normalizedValue), [normalizedValue]);
  const isEmpty = plainLength === 0;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const currentNormalized = normalizeRichTextValue(editor.innerHTML);
    if (currentNormalized !== normalizedValue) {
      editor.innerHTML = normalizedValue || EMPTY_EDITOR_HTML;
    }

    lastSentValueRef.current = normalizedValue;
  }, [normalizedValue]);

  function focusEditor() {
    const editor = editorRef.current;
    if (!editor) {
      return null;
    }

    editor.focus();
    if (!selectionBelongsToEditor(editor)) {
      moveCaretToEnd(editor);
    }
    return editor;
  }

  function emitChange(options?: { normalizeDom?: boolean; keepFocus?: boolean }) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const normalized = normalizeRichTextValue(editor.innerHTML);
    const nextLength = getRichTextLength(normalized);
    if (typeof maxLength === 'number' && nextLength > maxLength) {
      editor.innerHTML = lastSentValueRef.current || EMPTY_EDITOR_HTML;
      if (options?.keepFocus) {
        focusEditor();
      }
      return;
    }

    if (options?.normalizeDom) {
      editor.innerHTML = normalized || EMPTY_EDITOR_HTML;
      if (options.keepFocus) {
        focusEditor();
      }
    }

    lastSentValueRef.current = normalized;
    onChange(normalized);
  }

  function runCommand(command: string, valueToApply?: string) {
    const editor = focusEditor();
    if (!editor) {
      return;
    }

    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, valueToApply);
    emitChange({ keepFocus: true });
  }

  function insertLinkFromPrompt() {
    const editor = focusEditor();
    if (!editor) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    const rawUrl = window.prompt('Enter URL', 'https://');
    if (!rawUrl || !rawUrl.trim()) {
      return;
    }

    const href = sanitizeBlogHref(normalizeBlogEditorUrl(rawUrl));
    if (!href || href === '#') {
      return;
    }

    const label = selectedText || window.prompt('Link text', href)?.trim() || href;
    const html = `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
    document.execCommand('insertHTML', false, html);
    emitChange({ keepFocus: true });
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text/plain');
    if (!pastedText.trim()) {
      return;
    }

    const editor = focusEditor();
    if (!editor) {
      return;
    }

    const selectionText = window.getSelection()?.toString().trim() || '';
    const trimmed = pastedText.trim();
    if (/^(https?:\/\/|www\.)/i.test(trimmed) && selectionText) {
      const href = sanitizeBlogHref(normalizeBlogEditorUrl(trimmed));
      if (href && href !== '#') {
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${escapeHtml(href)}">${escapeHtml(selectionText)}</a>`
        );
        emitChange({ keepFocus: true });
        return;
      }
    }

    document.execCommand('insertHTML', false, normalizeRichTextValue(pastedText) || escapeHtml(pastedText));
    emitChange({ keepFocus: true });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-black/25 px-2.5 py-2">
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand('bold');
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-text/70 hover:border-primary/35 hover:text-primary"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand('italic');
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-text/70 hover:border-primary/35 hover:text-primary"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand('underline');
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-text/70 hover:border-primary/35 hover:text-primary"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            insertLinkFromPrompt();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-text/70 hover:border-primary/35 hover:text-primary"
          title="Insert link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1">
          <Type className="h-3.5 w-3.5 text-brand-text/45" />
          {sizeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                runCommand('fontSize', option.value);
              }}
              className="rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest text-brand-text/75 hover:bg-white/10 hover:text-primary"
              title={option.title}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1">
          {colorOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                runCommand('foreColor', option.value);
              }}
              className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] hover:border-primary/35"
              title={`${option.label} text`}
            >
              <span className={`h-3.5 w-3.5 rounded-full border border-black/25 ${option.swatchClassName}`} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || 'Start writing...'}
        data-empty={isEmpty ? 'true' : 'false'}
        onInput={() => emitChange()}
        onBlur={() => emitChange({ normalizeDom: true })}
        onPaste={handlePaste}
        className={`rich-text-editor-surface min-h-36 w-full bg-transparent px-4 py-3 text-sm leading-7 text-brand-text focus:outline-none ${className}`}
      />

      {typeof maxLength === 'number' ? (
        <div className="border-t border-white/10 px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest text-brand-text/35">
          {plainLength}/{maxLength}
        </div>
      ) : null}
    </div>
  );
}
