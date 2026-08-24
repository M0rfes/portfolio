"use client";

import { Children, isValidElement, type ReactNode } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";

const Mermaid = dynamic(
  () => import("./Mermaid").then((module) => module.Mermaid),
  {
    ssr: false,
    loading: () => <div className="mermaid-diagram mermaid-diagram-pending" />,
  },
);

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return "";
}

const MERMAID_START =
  /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|mindmap|timeline|gitGraph|journey|C4Context)\b/;

function extractMermaidSource(
  children: ReactNode,
  className?: string,
): string | null {
  const text = getNodeText(children).trim();
  if (!text) {
    return null;
  }

  const classNames = [className];
  Children.forEach(children, (child) => {
    if (isValidElement<{ className?: string }>(child)) {
      classNames.push(child.props.className);
    }
  });

  const labeled = classNames.some((value) => /\bmermaid\b/.test(value ?? ""));
  if (labeled || MERMAID_START.test(text)) {
    return text;
  }
  return null;
}

export function NoteMarkdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrism, { ignoreMissing: true }]]}
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
        pre: ({ children, className, ...props }) => {
          const source = extractMermaidSource(children, className);
          if (source) {
            return <Mermaid chart={source} />;
          }
          return (
            <div className="overflow-x-auto my-8 max-w-full">
              <pre className={className} {...props}>
                {children}
              </pre>
            </div>
          );
        },
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-8 max-w-full">
            <table className="blog-table" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="blog-thead" {...props}>
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }) => (
          <tbody className="blog-tbody" {...props}>
            {children}
          </tbody>
        ),
        th: ({ children, ...props }) => (
          <th className="blog-th" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="blog-td" {...props}>
            {children}
          </td>
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
