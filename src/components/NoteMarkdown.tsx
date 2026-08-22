import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";

export function NoteMarkdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypePrism]}
      components={{
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            {...props}
            className="blog-link"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        h1: ({ children, ...props }) => (
          <h1 className="blog-h1" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="blog-h2" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="blog-h3" {...props}>
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p className="blog-p" {...props}>
            {children}
          </p>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote className="blog-blockquote" {...props}>
            {children}
          </blockquote>
        ),
        ul: ({ children, ...props }) => (
          <ul className="blog-ul" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="blog-ol" {...props}>
            {children}
          </ol>
        ),
        strong: ({ children, ...props }) => (
          <strong className="blog-strong" {...props}>
            {children}
          </strong>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code className="blog-inline-code" {...props}>
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children, ...props }) => (
          <div className="overflow-x-auto my-8 max-w-full">
            <pre {...props}>{children}</pre>
          </div>
        ),
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-8 max-w-full">
            <table className="blog-table" {...props}>
              {children}
            </table>
          </div>
        ),
        img: ({ src, alt }) =>
          src ? (
            <img
              src={src}
              alt={alt ?? ""}
              className="rounded-lg shadow-md w-full h-auto my-8"
            />
          ) : null,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
