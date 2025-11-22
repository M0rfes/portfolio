import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
  content: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
}

const blogsDirectory = path.join(process.cwd(), 'content/blogs');

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(blogsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  // Validate slug to prevent path traversal
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      coverImage: data.coverImage || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      keywords: data.keywords || [],
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllBlogPosts(): BlogPostMetadata[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getBlogPostBySlug(slug);
      if (!post) return null;
      
      // Return only metadata, not content
      const { content: _content, ...metadata } = post;
      return metadata;
    })
    .filter((post): post is BlogPostMetadata => post !== null)
    .sort((a, b) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

export function searchBlogPosts(query: string): BlogPostMetadata[] {
  const allPosts = getAllBlogPosts();
  
  if (!query || query.trim() === '') {
    return allPosts;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return allPosts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(searchTerm);
    const slugMatch = post.slug.toLowerCase().includes(searchTerm);
    const keywordsMatch = post.keywords.some((keyword) =>
      keyword.toLowerCase().includes(searchTerm)
    );
    const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm);

    return titleMatch || slugMatch || keywordsMatch || excerptMatch;
  });
}
