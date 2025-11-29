import fs from 'fs';
import path from 'path';

export interface BlogPostMeta {
  title: string;
  coverImage: string;
  excerpt?: string;
  date: string;
  keywords: string[];
}

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
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''));
}

// Extract meta export from MDX file content
function extractMetaFromMdx(content: string): BlogPostMeta | null {
  // Match export const meta = { ... }; pattern
  const metaMatch = content.match(/export\s+const\s+meta\s*=\s*(\{[\s\S]*?\});/);
  if (!metaMatch) return null;
  
  try {
    // Use Function constructor to safely evaluate the object literal
    const metaString = metaMatch[1];
    const meta = new Function(`return ${metaString}`)();
    return meta as BlogPostMeta;
  } catch {
    console.error('Failed to parse meta from MDX');
    return null;
  }
}

// Get content without the meta export for rendering
function getContentWithoutMeta(content: string): string {
  // Remove the export const meta = { ... }; line
  return content.replace(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\};\s*\n?/, '');
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  // Validate slug to prevent path traversal
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const meta = extractMetaFromMdx(fileContents);
    
    if (!meta) {
      console.error(`No meta found in ${slug}.mdx`);
      return null;
    }

    const content = getContentWithoutMeta(fileContents);

    return {
      slug,
      title: meta.title || '',
      coverImage: meta.coverImage || '',
      excerpt: meta.excerpt || '',
      date: meta.date || '',
      keywords: meta.keywords || [],
      content,
    };
  } catch (error) {
    if (error && typeof error === 'object' && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File not found: return null
      return null;
    }
    // Unexpected error: log and re-throw
    console.error(`Error reading blog post ${slug}:`, error);
    throw error;
  }
}

export function getAllBlogPosts(): BlogPostMetadata[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map((slug): BlogPostMetadata | null => {
      try {
        const fullPath = path.join(blogsDirectory, `${slug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const meta = extractMetaFromMdx(fileContents);
        
        if (!meta) return null;
        
        return {
          slug,
          title: meta.title || '',
          coverImage: meta.coverImage || '',
          excerpt: meta.excerpt,
          date: meta.date || '',
          keywords: meta.keywords || [],
        };
      } catch {
        return null;
      }
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
