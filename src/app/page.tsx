import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { getAllBlogPosts } from "@/lib/blog";

export default function Home() {
  const posts = getAllBlogPosts();
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <Hero />
      <About latestPosts={latestPosts} />
      <Experience />
      <Skills />
      <Contact />
    </>
  );
}
