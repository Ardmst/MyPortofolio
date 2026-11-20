import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: content }) => (
          <a href={href} target="_blank" rel="noreferrer noopener">
            {content}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
