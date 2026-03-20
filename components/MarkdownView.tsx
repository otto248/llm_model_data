import { marked } from 'marked';

export function MarkdownView({ content }: { content: string }) {
  const html = marked.parse(content, { async: false });
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}
