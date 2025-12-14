export interface FeedConfig {
  name: string;
  url: string;
}

export const FEEDS: FeedConfig[] = [
  {
    name: "Netflix Tech Blog",
    url: "https://netflixtechblog.medium.com/feed",
  },
  {
    name: "PlanetScale Blog",
    url: "https://planetscale.com/blog/feed.atom",
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
  },
  {
    name: "Metadata [distributed systems]",
    url: "https://muratbuffalo.blogspot.com/feeds/posts/default",
  },
  {
    name: "Neon Blog",
    url: "https://neon.com/blog/rss.xml",
  },
  {
    name: "Thomas Neumann's bibliography",
    url: "https://dblp.org/pid/n/ThomasNeumann.rss",
  },
  {
    name: "Without Boats",
    url: "https://without.boats/index.xml",
  },
  {
    name: "research!rsc by Russ Cox",
    url: "https://research.swtch.com/feed.atom",
  },
  {
    name: "Supabase Blog",
    url: "https://supabase.com/rss.xml",
  },
  {
    name: "AWS Database Blog",
    url: "https://aws.amazon.com/blogs/database/feed/",
  },
];
