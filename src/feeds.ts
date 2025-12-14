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
    url: "https://planetscale.com/blog/feed.atom"
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
  },
];
