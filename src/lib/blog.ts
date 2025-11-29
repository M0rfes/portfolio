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

// Find the matching closing brace for the meta object
function findMetaObjectEnd(content: string, startIndex: number): number {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    // Handle string boundaries (skip escaped quotes)
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    
    // Skip characters inside strings
    if (inString) continue;
    
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  
  return -1;
}

// Extract meta export from MDX file content
function extractMetaFromMdx(content: string, filePath?: string): BlogPostMeta | null {
  // Find the start of the meta export
  const metaStartMatch = content.match(/export\s+const\s+meta\s*=\s*\{/);
  if (!metaStartMatch || metaStartMatch.index === undefined) return null;
  
  const objectStartIndex = metaStartMatch.index + metaStartMatch[0].length - 1;
  const objectEndIndex = findMetaObjectEnd(content, objectStartIndex);
  
  if (objectEndIndex === -1) {
    console.error(`Failed to find closing brace for meta in ${filePath || 'unknown file'}`);
    return null;
  }
  
  const metaString = content.slice(objectStartIndex, objectEndIndex + 1);
  
  try {
    // Note: new Function() is used here intentionally for evaluating trusted MDX content
    // from the repository's content/blogs directory. This runs at build time only.
    const meta = new Function(`return ${metaString}`)();
    return meta as BlogPostMeta;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to parse meta from ${filePath || 'unknown file'}: ${errorMessage}`);
    return null;
  }
}

// Get content without the meta export for rendering
function getContentWithoutMeta(content: string): string {
  // Find and remove the entire export const meta = { ... }; statement
  const metaStartMatch = content.match(/export\s+const\s+meta\s*=\s*\{/);
  if (!metaStartMatch || metaStartMatch.index === undefined) return content;
  
  const objectStartIndex = metaStartMatch.index + metaStartMatch[0].length - 1;
  const objectEndIndex = findMetaObjectEnd(content, objectStartIndex);
  
  if (objectEndIndex === -1) return content;
  
  // Find the semicolon and newline after the closing brace
  let endIndex = objectEndIndex + 1;
  while (endIndex < content.length && (content[endIndex] === ';' || content[endIndex] === '\n' || content[endIndex] === '\r' || content[endIndex] === ' ')) {
    endIndex++;
  }
  
  return content.slice(0, metaStartMatch.index) + content.slice(endIndex);
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  // Validate slug to prevent path traversal
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    return null;
  }
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const meta = extractMetaFromMdx(fileContents, fullPath);
    
    if (!meta) {
      console.error(`No meta found in ${fullPath}`);
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
        const meta = extractMetaFromMdx(fileContents, fullPath);
        
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
