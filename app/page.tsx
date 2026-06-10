import { HomePageSections } from "@/components/sections/home-page";
import { getPublishedPosts } from "@/lib/blog";

export default function Home() {
  const latestPosts = getPublishedPosts()
    .slice(0, 3)
    .map(({ category, date, description, readingTime, slug, title }) => ({
      category,
      date,
      description,
      readingTime,
      slug,
      title,
    }));

  return <HomePageSections latestPosts={latestPosts} />;
}
