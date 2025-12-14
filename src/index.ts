import { FEEDS, FeedConfig } from "./feeds.ts";

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  feedName: string;
}

const CORS_PROXY = "https://corsproxy.io/?url=";

function parseFeed(xml: string, feedName: string): FeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  // Try RSS format first
  const rssItems = doc.querySelectorAll("item");
  if (rssItems.length > 0) {
    return Array.from(rssItems).map((item) => ({
      title: item.querySelector("title")?.textContent || "Untitled",
      link: item.querySelector("link")?.textContent || "#",
      pubDate: item.querySelector("pubDate")?.textContent || "",
      feedName,
    }));
  }

  // Try Atom format
  const atomEntries = doc.querySelectorAll("entry");
  if (atomEntries.length > 0) {
    return Array.from(atomEntries).map((entry) => ({
      title: entry.querySelector("title")?.textContent || "Untitled",
      link: entry.querySelector("link[href]")?.getAttribute("href") || "#",
      pubDate: entry.querySelector("published")?.textContent ||
        entry.querySelector("updated")?.textContent ||
        "",
      feedName,
    }));
  }

  throw new Error(`Error parsing feed: ${feedName}`);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

async function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
  const response = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feed.name}`);
  }
  const xml = await response.text();
  const items = parseFeed(xml, feed.name);

  return items;
}

function main(): void {
  // Global state
  const allItems: FeedItem[] = [];

  // HTML elements
  const feedList = document.getElementById("feed-list");
  if (!feedList) return;
  const app = document.getElementById("app");
  if (!app) return;

  const feedStatusList =    FEEDS.map((feed) => {
      const status = "loading";
      const node = document.createElement("li");
      node.className = `feed-status-${status}`;
      node.textContent = `${feed.name} (${status})`;
      return node;
    });

    feedList.replaceChildren(...feedStatusList);

    // Start fetching all feeds (don't wait for Promise.all)
  FEEDS.forEach((feed, idx) => {
      const feedStatus = feedStatusList[idx];
    fetchFeed(feed).then((feedItems) => {
      // Update UI after each feed completes
      feedStatus.className = "feed-status-success";
      feedStatus.textContent = `${feed.name} (loaded)`;

      // `allItems` is sorted. Sort us and then insert ourselves into the sorted array.
      const sortedFeedItems = feedItems.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime() || 0;
        const dateB = new Date(b.pubDate).getTime() || 0;
        return dateB - dateA;
      });

      sortedFeedItems.forEach((item) => {

        const insertItem = document.createElement('div');
        insertItem.className = 'feed-item';
        insertItem.innerHTML = `
                  <h3><a href="${new URL(item.link)}" target="_blank" rel="noopener">${item.title}</a></h3>
                  <p class="feed-source">${item.feedName}</p>
                  <p class="feed-date">${formatDate(item.pubDate)}</p>
              `;

        if (allItems.length === 0) {
          allItems.push(item);
          app.replaceChildren(insertItem);
        } else {
          const insertIndex = allItems.findIndex((existingItem) => new Date(existingItem.pubDate).getTime() < new Date(item.pubDate).getTime());
          if (insertIndex === -1) {
            allItems.push(item);
            app.appendChild(insertItem);
          } else {
            allItems.splice(insertIndex, 0, item);
            app.insertBefore(insertItem, app.childNodes[insertIndex]);
          }
        }
      });
    }).catch((error) => {
      console.error(`Error fetching ${feed.name}:`, error);
      feedStatus.className = "feed-status-failed";
      feedStatus.textContent = `${feed.name} (failed)`;
    });
  });
}

main();
