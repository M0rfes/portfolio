import { ComponentType, lazy } from "react";

export interface BlogPostMeta {
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
}

export interface BlogEntry {
  slug: string;
  meta: Promise<BlogPostMeta>;
  Content: ComponentType;
}

// Registry of all blog posts - add new blogs here manually
export const blogRegistry: Record<string, BlogEntry> = {
  "asynclocalstorage-express-logger": {
    slug: "asynclocalstorage-express-logger",
    meta: import("./asynclocalstorage-express-logger.mdx").then((m) => m.meta),
    Content: lazy(() => import("./asynclocalstorage-express-logger.mdx")),
  },
  "resumable-downloads-react-nodejs": {
    slug: "resumable-downloads-react-nodejs",
    meta: import("./resumable-downloads-react-nodejs.mdx").then((m) => m.meta),
    Content: lazy(() => import("./resumable-downloads-react-nodejs.mdx")),
  },
  "streaming-json-multipart-mixed": {
    slug: "streaming-json-multipart-mixed",
    meta: import("./streaming-json-multipart-mixed.mdx").then((m) => m.meta),
    Content: lazy(() => import("./streaming-json-multipart-mixed.mdx")),
  },
  "deferred-commit-pattern": {
    slug: "deferred-commit-pattern",
    meta: import("./deferred-commit-pattern.mdx").then((m) => m.meta),
    Content: lazy(() => import("./deferred-commit-pattern.mdx")),
  },
  "group-by-rollup-grouping-sets-and-cube": {
    slug: "group-by-rollup-grouping-sets-and-cube",
    meta: import("./group-by-rollup-grouping-sets-and-cube.mdx").then(
      (m) => m.meta,
    ),
    Content: lazy(() => import("./group-by-rollup-grouping-sets-and-cube.mdx")),
  },
};

// Get all blog slugs
export function getAllBlogSlugs(): string[] {
  return Object.keys(blogRegistry);
}

// Get a blog entry by slug
export function getBlogBySlug(slug: string): BlogEntry | null {
  return blogRegistry[slug] || null;
}

// Get all blog posts metadata sorted by date
export async function getAllBlogPosts(): Promise<
  (BlogPostMeta & { slug: string })[]
> {
  const blogs = Object.values(blogRegistry);
  return await Promise.all(
    blogs.map(async (b) => {
      const meta = await b.meta;

      return {
        ...meta,
        slug: b.slug,
      };
    }),
  );
}

// Search blog posts
export async function searchBlogPosts(
  query: string,
): Promise<(BlogPostMeta & { slug: string })[]> {
  const allPosts = await getAllBlogPosts();

  if (!query || query.trim() === "") {
    return allPosts;
  }

  const searchTerm = query.toLowerCase().trim();

  return allPosts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(searchTerm);
    const slugMatch = post.slug.toLowerCase().includes(searchTerm);
    const keywordsMatch = post.keywords.some((keyword) =>
      keyword.toLowerCase().includes(searchTerm),
    );
    const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm);

    return titleMatch || slugMatch || keywordsMatch || excerptMatch;
  });
}
