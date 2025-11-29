import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { getAllBlogPosts } from "@/lib/blog";

export default async function Home() {
  const posts = await getAllBlogPosts();
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
