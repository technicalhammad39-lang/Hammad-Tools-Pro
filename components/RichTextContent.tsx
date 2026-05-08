import { normalizeRichTextValue } from '@/lib/rich-text';

type RichTextContentProps = {
  content?: string;
  value?: string;
  className?: string;
  paragraphClassName?: string;
};

export default function RichTextContent({
  content,
  value,
  className = '',
  paragraphClassName = '',
}: RichTextContentProps) {
  const richText = content ?? value ?? '';
  const html = normalizeRichTextValue(richText);

  if (!html) {
    return null;
  }

  return (
    <div
      className={['rich-text-content', paragraphClassName, className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
