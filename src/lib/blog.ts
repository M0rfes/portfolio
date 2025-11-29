// Re-export everything from the blog registry
export {
  getAllBlogSlugs,
  getBlogBySlug,
  getAllBlogPosts,
  searchBlogPosts,
  type BlogPostMeta,
  type BlogEntry,
} from '@/content/blogs';

// Legacy type for backwards compatibility
export interface BlogPostMetadata {
  slug: string;
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
}
