import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom component for images
    img: (props: { alt?: string; src?: string; width?: number | string; height?: number | string }) => {
      const { alt, src, width: w, height: h } = props;
      if (!src) return null;
      const width = typeof w === 'string' ? parseInt(w, 10) : w || 1200;
      const height = typeof h === 'string' ? parseInt(h, 10) : h || 630;
      const hasAlt = !!(alt && alt.trim());
      return (
        <span className="block my-8">
          <Image
            src={src}
            alt={hasAlt ? alt! : ''}
            role={hasAlt ? undefined : 'presentation'}
            width={width}
            height={height}
            loading="lazy"
            className="rounded-lg shadow-md w-full h-auto"
          />
        </span>
      );
    },
    // Custom component for videos
    video: ({ ...props }) => (
      <span className="block my-8">
        <video
          {...props}
          className="rounded-lg shadow-md w-full"
          controls
        />
      </span>
    ),
    // Custom component for links
    a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={href}
        {...props}
        className="blog-link"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      />
    ),
    // Custom component for code blocks
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="blog-inline-code"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Custom component for tables
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-8">
        <table className="blog-table" {...props} />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="blog-thead" {...props} />
    ),
    tbody: ({ ...props }) => (
      <tbody className="blog-tbody" {...props} />
    ),
    th: ({ ...props }) => (
      <th className="blog-th" {...props} />
    ),
    td: ({ ...props }) => (
      <td className="blog-td" {...props} />
    ),
    // Custom component for headings
    h1: ({ ...props }) => (
      <h1 className="blog-h1" {...props} />
    ),
    h2: ({ ...props }) => (
      <h2 className="blog-h2" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3 className="blog-h3" {...props} />
    ),
    // Custom component for paragraphs
    p: ({ ...props }) => (
      <p className="blog-p" {...props} />
    ),
    // Custom component for blockquotes
    blockquote: ({ ...props }) => (
      <blockquote className="blog-blockquote" {...props} />
    ),
    // Custom component for lists
    ul: ({ ...props }) => (
      <ul className="blog-ul" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="blog-ol" {...props} />
    ),
    // Custom component for strong/bold text
    strong: ({ ...props }) => (
      <strong className="blog-strong" {...props} />
    ),
    ...components,
  };
}
