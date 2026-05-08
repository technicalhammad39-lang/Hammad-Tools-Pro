import sanitizeHtml from 'sanitize-html';
import {
  buildBlogRelValue,
  isExternalBlogHref,
  normalizeBlogEditorUrl,
  sanitizeBlogHref,
} from '@/lib/blog-links';

export const RICH_TEXT_ALLOWED_ELEMENTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'strong',
  'em',
  'u',
  'span',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'hr',
  'br',
] as const;

const RICH_TEXT_ALLOWED_COLORS = new Set(['white', 'yellow', 'grey']);
const RICH_TEXT_ALLOWED_SIZES = new Set(['small', 'medium', 'large']);
const CONTAINS_HTML_PATTERN = /<[a-z][\s\S]*>/i;
const MARKDOWN_URL_PATTERN = /(^|[\s(])((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,!?;:])/gi;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
const HTML_ENTITY_PATTERN = /&(nbsp|amp|lt|gt|quot|#39);/g;

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtmlEntities(value: string) {
  return value.replace(HTML_ENTITY_PATTERN, (_, entity: string) => {
    if (entity === 'nbsp') return ' ';
    if (entity === 'amp') return '&';
    if (entity === 'lt') return '<';
    if (entity === 'gt') return '>';
    if (entity === 'quot') return '"';
    if (entity === '#39') return "'";
    return ' ';
  });
}

function normalizeRichColor(value: string) {
  const normalized = value.trim().toLowerCase();
  if (RICH_TEXT_ALLOWED_COLORS.has(normalized)) {
    return normalized as 'white' | 'yellow' | 'grey';
  }

  if (
    normalized.includes('ffd600') ||
    normalized.includes('ffea00') ||
    normalized.includes('255, 214, 0') ||
    normalized.includes('255,214,0')
  ) {
    return 'yellow';
  }

  if (
    normalized.includes('f5f5f5') ||
    normalized.includes('255, 255, 255') ||
    normalized.includes('255,255,255') ||
    normalized === 'white'
  ) {
    return 'white';
  }

  if (
    normalized.includes('8e8e8e') ||
    normalized.includes('808080') ||
    normalized.includes('128, 128, 128') ||
    normalized.includes('142, 142, 142') ||
    normalized.includes('gray') ||
    normalized.includes('grey')
  ) {
    return 'grey';
  }

  return '';
}

function normalizeRichSize(value: string) {
  const normalized = value.trim().toLowerCase();
  if (RICH_TEXT_ALLOWED_SIZES.has(normalized)) {
    return normalized as 'small' | 'medium' | 'large';
  }

  if (['1', '2', 'small', 'x-small', 'smaller', '0.875rem', '14px'].includes(normalized)) {
    return 'small';
  }
  if (['3', 'medium', '1rem', '16px'].includes(normalized)) {
    return 'medium';
  }
  if (
    ['4', '5', '6', '7', 'large', 'x-large', 'larger', '1.25rem', '1.5rem', '20px', '24px'].includes(normalized)
  ) {
    return 'large';
  }

  return '';
}

function parseStyleMap(value: string) {
  return value
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const [rawKey, ...rest] = entry.split(':');
      const key = (rawKey || '').trim().toLowerCase();
      const nextValue = rest.join(':').trim().toLowerCase();
      if (key && nextValue) {
        acc[key] = nextValue;
      }
      return acc;
    }, {});
}

function transformSpanLikeAttributes(attribs: Record<string, string>) {
  const styles = parseStyleMap(String(attribs.style || ''));
  const color =
    normalizeRichColor(String(attribs['data-rich-color'] || '')) ||
    normalizeRichColor(String(attribs.color || '')) ||
    normalizeRichColor(styles.color || '');
  const size =
    normalizeRichSize(String(attribs['data-rich-size'] || '')) ||
    normalizeRichSize(String(attribs.size || '')) ||
    normalizeRichSize(styles['font-size'] || '');

  const nextAttribs: Record<string, string> = {};
  if (color) {
    nextAttribs['data-rich-color'] = color;
  }
  if (size && size !== 'medium') {
    nextAttribs['data-rich-size'] = size;
  }
  return nextAttribs;
}

function resolveStyledInlineTag(attribs: Record<string, string>) {
  const styles = parseStyleMap(String(attribs.style || ''));
  const hasColorOrSize = Boolean(
    normalizeRichColor(String(attribs['data-rich-color'] || '')) ||
      normalizeRichColor(String(attribs.color || '')) ||
      normalizeRichColor(styles.color || '') ||
      normalizeRichSize(String(attribs['data-rich-size'] || '')) ||
      normalizeRichSize(String(attribs.size || '')) ||
      normalizeRichSize(styles['font-size'] || '')
  );

  if (hasColorOrSize) {
    return '';
  }

  const fontWeight = String(styles['font-weight'] || '').toLowerCase();
  const fontStyle = String(styles['font-style'] || '').toLowerCase();
  const textDecoration = `${styles['text-decoration'] || ''} ${styles['text-decoration-line'] || ''}`.toLowerCase();

  if (fontWeight === 'bold' || fontWeight === 'bolder' || Number(fontWeight) >= 600) {
    return 'strong';
  }

  if (fontStyle === 'italic' || fontStyle === 'oblique') {
    return 'em';
  }

  if (textDecoration.includes('underline')) {
    return 'u';
  }

  return '';
}

function transformAnchorAttributes(attribs: Record<string, string>) {
  const normalizedHref = sanitizeBlogHref(normalizeBlogEditorUrl(String(attribs.href || '')));
  const isExternal = isExternalBlogHref(normalizedHref);
  const wantsNewTab = String(attribs.target || '').trim().toLowerCase() === '_blank' || isExternal;
  const nofollow = String(attribs.rel || '').toLowerCase().includes('nofollow');
  const rel = buildBlogRelValue({
    external: isExternal,
    nofollow,
    openInNewTab: wantsNewTab,
  });

  const nextAttribs: Record<string, string> = {};
  if (normalizedHref !== '#') {
    nextAttribs.href = normalizedHref;
  }
  if (attribs.title?.trim()) {
    nextAttribs.title = attribs.title.trim();
  }
  if (wantsNewTab) {
    nextAttribs.target = '_blank';
  }
  if (rel) {
    nextAttribs.rel = rel;
  }
  return nextAttribs;
}

function autoLinkInlineHtml(value: string) {
  return value.replace(MARKDOWN_URL_PATTERN, (match, prefix: string, rawUrl: string) => {
    const href = sanitizeBlogHref(normalizeBlogEditorUrl(rawUrl));
    if (!href || href === '#') {
      return match;
    }
    const rel = buildBlogRelValue({
      external: isExternalBlogHref(href),
      nofollow: false,
      openInNewTab: isExternalBlogHref(href),
    });
    const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
    const targetAttr = isExternalBlogHref(href) ? ' target="_blank"' : '';
    return `${prefix}<a href="${escapeHtml(href)}"${targetAttr}${relAttr}>${escapeHtml(rawUrl)}</a>`;
  });
}

function applyInlineMarkdown(value: string) {
  const escaped = escapeHtml(value);
  const tokenMap = new Map<string, string>();
  let tokenIndex = 0;

  const withMarkdownLinks = escaped.replace(
    MARKDOWN_LINK_PATTERN,
    (_match, label: string, rawHref: string, rawTitle?: string) => {
      const href = sanitizeBlogHref(normalizeBlogEditorUrl(rawHref));
      const title = String(rawTitle || '').trim();
      const isExternal = isExternalBlogHref(href);
      const rel = buildBlogRelValue({
        external: isExternal,
        nofollow: false,
        openInNewTab: isExternal,
      });
      const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      const targetAttr = isExternal ? ' target="_blank"' : '';
      const token = `__RICH_LINK_${tokenIndex += 1}__`;
      tokenMap.set(
        token,
        href && href !== '#'
          ? `<a href="${escapeHtml(href)}"${titleAttr}${targetAttr}${relAttr}>${escapeHtml(label)}</a>`
          : escapeHtml(label)
      );
      return token;
    }
  );

  const withAutoLinks = autoLinkInlineHtml(withMarkdownLinks)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>');

  let result = withAutoLinks;
  tokenMap.forEach((html, token) => {
    result = result.replaceAll(token, html);
  });
  return result;
}

function flushParagraph(buffer: string[], blocks: string[]) {
  if (!buffer.length) {
    return;
  }
  const content = buffer.map((entry) => applyInlineMarkdown(entry)).join('<br />');
  blocks.push(`<p>${content}</p>`);
  buffer.length = 0;
}

function flushList(type: 'ul' | 'ol' | null, items: string[], blocks: string[]) {
  if (!type || !items.length) {
    items.length = 0;
    return;
  }
  const listItems = items.map((entry) => `<li>${applyInlineMarkdown(entry)}</li>`).join('');
  blocks.push(`<${type}>${listItems}</${type}>`);
  items.length = 0;
}

export function containsRichTextHtml(value: string) {
  return CONTAINS_HTML_PATTERN.test(value || '');
}

export function convertLegacyRichTextToHtml(value: string) {
  const normalized = normalizeLineEndings(String(value || '')).trim();
  if (!normalized) {
    return '';
  }

  if (containsRichTextHtml(normalized)) {
    return normalized;
  }

  const lines = normalized.split('\n');
  const blocks: string[] = [];
  const paragraphBuffer: string[] = [];
  const listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listType, listItems, blocks);
      listType = null;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listType, listItems, blocks);
      listType = null;
      const level = Math.min(6, Math.max(1, headingMatch[1].length));
      blocks.push(`<h${level}>${applyInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listType, listItems, blocks);
      listType = null;
      blocks.push('<hr />');
      continue;
    }

    const quoteMatch = line.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      flushParagraph(paragraphBuffer, blocks);
      flushList(listType, listItems, blocks);
      listType = null;
      blocks.push(`<blockquote><p>${applyInlineMarkdown(quoteMatch[1])}</p></blockquote>`);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph(paragraphBuffer, blocks);
      if (listType && listType !== 'ol') {
        flushList(listType, listItems, blocks);
      }
      listType = 'ol';
      listItems.push(orderedMatch[1]);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph(paragraphBuffer, blocks);
      if (listType && listType !== 'ul') {
        flushList(listType, listItems, blocks);
      }
      listType = 'ul';
      listItems.push(unorderedMatch[1]);
      continue;
    }

    if (listType) {
      flushList(listType, listItems, blocks);
      listType = null;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph(paragraphBuffer, blocks);
  flushList(listType, listItems, blocks);

  return blocks.join('');
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...RICH_TEXT_ALLOWED_ELEMENTS],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    span: ['data-rich-color', 'data-rich-size'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  selfClosing: ['br', 'hr'],
  transformTags: {
    b: 'strong',
    i: 'em',
    div: 'p',
    font: (_tagName, attribs) => ({
      tagName: 'span',
      attribs: transformSpanLikeAttributes(attribs),
    }),
    span: (_tagName, attribs) => {
      const inlineTag = resolveStyledInlineTag(attribs);
      if (inlineTag) {
        return {
          tagName: inlineTag,
          attribs: {},
        };
      }

      return {
        tagName: 'span',
        attribs: transformSpanLikeAttributes(attribs),
      };
    },
    a: (_tagName, attribs) => ({
      tagName: 'a',
      attribs: transformAnchorAttributes(attribs),
    }),
  },
};

function stripRichTextHtmlToPlainText(html: string) {
  const plain = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return decodeHtmlEntities(plain).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sanitizeRichTextHtml(value: string) {
  const normalized = normalizeLineEndings(String(value || '')).trim();
  if (!normalized) {
    return '';
  }

  const sanitized = sanitizeHtml(normalized, SANITIZE_OPTIONS)
    .replace(/&nbsp;/g, ' ')
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '')
    .trim();

  if (!sanitized) {
    return '';
  }

  return stripRichTextHtmlToPlainText(sanitized) ? sanitized : '';
}

export function normalizeRichTextValue(value: string) {
  const html = convertLegacyRichTextToHtml(String(value || ''));
  return sanitizeRichTextHtml(html);
}

export function autoLinkPlainUrls(value: string) {
  return normalizeRichTextValue(value || '');
}

export function richTextToPlainText(value: string) {
  const html = containsRichTextHtml(value || '')
    ? sanitizeRichTextHtml(value)
    : convertLegacyRichTextToHtml(value || '');
  if (!html) {
    return '';
  }

  return stripRichTextHtmlToPlainText(html);
}

export function getRichTextLength(value: string) {
  return richTextToPlainText(value).length;
}
