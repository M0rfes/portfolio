import { ComponentType } from "react";

// Import meta and components directly from MDX files
import AsyncLocalStorageContent, {
  meta as asyncLocalStorageMeta,
} from "./asynclocalstorage-express-logger.mdx";
import ResumableDownloadsContent, {
  meta as resumableDownloadsMeta,
} from "./resumable-downloads-react-nodejs.mdx";
import StreamingJsonContent, {
  meta as streamingJsonMeta,
} from "./streaming-json-multipart-mixed.mdx";

export interface BlogPostMeta {
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
}

export interface BlogEntry {
  slug: string;
  meta: BlogPostMeta;
  Content: ComponentType;
}

// Registry of all blog posts - add new blogs here manually
export const blogRegistry: Record<string, BlogEntry> = {
  "asynclocalstorage-express-logger": {
    slug: "asynclocalstorage-express-logger",
    meta: asyncLocalStorageMeta,
    Content: AsyncLocalStorageContent,
  },
  "resumable-downloads-react-nodejs": {
    slug: "resumable-downloads-react-nodejs",
    meta: resumableDownloadsMeta,
    Content: ResumableDownloadsContent,
  },
  "streaming-json-multipart-mixed": {
    slug: "streaming-json-multipart-mixed",
    meta: streamingJsonMeta,
    Content: StreamingJsonContent,
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
export function getAllBlogPosts(): (BlogPostMeta & { slug: string })[] {
  return Object.values(blogRegistry)
    .map((entry) => ({
      slug: entry.slug,
      ...entry.meta,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Search blog posts
export function searchBlogPosts(
  query: string,
): (BlogPostMeta & { slug: string })[] {
  const allPosts = getAllBlogPosts();

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
