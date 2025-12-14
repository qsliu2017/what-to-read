# What to Read

what-to-read is a frontend-only, single-page application that gathers items from RSS feeds specified in a configuration file.

## Configuration

RSS feeds are specified in `feeds.ts`. Schema:

```json
[
  {
    "name": "Feed Name",
    "url": "https://example.com/feed.xml"
  },
  {
    "name": "Another Feed",
    "url": "https://example.com/another-feed.xml"
  }
]
```

## Build

- `bun install`
- `bun build`
