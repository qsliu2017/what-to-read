import { FEEDS, FeedConfig } from "./feeds.ts";

interface FeedItem {
  title: string;
  link: string;
  pubDate: Date;
  feedName: string;
  feedIndex?: number;
}

function compareItem(a: FeedItem, b: FeedItem) {
  const dateA = a.pubDate.getTime();
  const dateB = b.pubDate.getTime();
  return dateB - dateA;
}

const CORS_PROXY = "https://corsproxy.io/?url=";

async function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
  const response = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feed.name}`);
  }
  const xml = await response.text();
  const items = parseFeed(xml, feed.name);

  return items;
}

function parseFeed(xml: string, feedName: string): FeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  // Try RSS format first
  const rssItems = doc.querySelectorAll("item");
  if (rssItems.length > 0) {
    return Array.from(rssItems).map((item) => ({
      title: item.querySelector("title")?.textContent || "Untitled",
      link: item.querySelector("link")?.textContent || "#",
      pubDate: new Date(item.querySelector("pubDate")?.textContent || 0),
      feedName,
    }));
  }

  // Try Atom format
  const atomEntries = doc.querySelectorAll("entry");
  if (atomEntries.length > 0) {
    return Array.from(atomEntries).map((entry) => ({
      title: entry.querySelector("title")?.textContent || "Untitled",
      link: entry.querySelector("link[href]")?.getAttribute("href") || "#",
      pubDate: new Date(
        entry.querySelector("published")?.textContent ||
          entry.querySelector("updated")?.textContent ||
          0,
      ),
      feedName,
    }));
  }

  throw new Error(`Error parsing feed: ${feedName}`);
}

function main(): void {
  // Global state
  const sortedItemList: FeedItem[] = [];
  const hiddenFeedIdxSet = new Set<number>();

  // HTML elements
  const feedList = document.getElementById("feed-list");
  if (!feedList) return;
  const app = document.getElementById("app");
  if (!app) return;
  const hiddenStyle = document.createElement("style");
  document.head.appendChild(hiddenStyle);

  const updateHiddenStyles = () => {
    if (hiddenFeedIdxSet.size === 0) {
      hiddenStyle.textContent = "";
    } else {
      const selectors = Array.from(hiddenFeedIdxSet)
        .map((feedId) => `.feed-${feedId}`)
        .join(", ");
      hiddenStyle.textContent = `${selectors} { display: none; }`;
    }
  };

  const renderAllItems = () => {
    if (sortedItemList.length === 0) {
      app.innerHTML = '<p class="loading">Loading feeds...</p>';
      return;
    }

    app.replaceChildren(
      ...sortedItemList.map((item) => {
        const insertItem = document.createElement("div");
        insertItem.className = `feed-item feed-${item.feedIndex}`;
        insertItem.innerHTML = `
                  <h3><a href="${new URL(
                    item.link,
                  )}" target="_blank" rel="noopener">${item.title}</a></h3>
                  <p class="feed-source">${item.feedName}</p>
                  <p class="feed-date">${item.pubDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}</p>
              `;
        return insertItem;
      }),
    );
  };

  const feedStatusList = FEEDS.map((feed, idx) => {
    const node = document.createElement("li");
    node.className = "feed-status-loading";

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.id = `feed-checkbox-${idx}`;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        hiddenFeedIdxSet.delete(idx);
      } else {
        hiddenFeedIdxSet.add(idx);
      }
      updateHiddenStyles();
    });

    // Create label
    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.className = "feed-label";
    label.textContent = feed.name;

    node.appendChild(checkbox);
    node.appendChild(label);

    return node;
  });

  feedList.replaceChildren(...feedStatusList);

  // Start fetching all feeds (don't wait for Promise.all)
  FEEDS.forEach((feed, idx) => {
    const feedStatus = feedStatusList[idx];
    fetchFeed(feed)
      .then((feedItems) => {
        // Update UI after each feed completes
        feedStatus.className = "feed-status-success";

        sortedItemList.push(
          ...feedItems.map((item) => ({ ...item, feedIndex: idx })),
        );
        sortedItemList.sort(compareItem);

        renderAllItems();
      })
      .catch((error) => {
        console.error(`Error fetching ${feed.name}:`, error);
        feedStatus.className = "feed-status-failed";
      });
  });
}

main();
