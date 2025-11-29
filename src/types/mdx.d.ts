declare module '*.mdx' {
  import type { ComponentType } from 'react';
  
  export const meta: {
    title: string;
    coverImage: string;
    excerpt?: string;
    date: string;
    keywords: string[];
  };
  
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
