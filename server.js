const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { XMLParser } = require("fast-xml-parser");

const port = Number(process.env.PORT) || 4173;
const cacheTtl = 5 * 60 * 1000;
const cache = new Map();
const publicRoot = __dirname;
const xmlParser = new XMLParser();

function upscaleCover(url) {
  return url.replace(/_SY\d+_/i, "_SY160_");
}

function parseItems(xml) {
  const parsed = xmlParser.parse(xml);
  const feedItems = parsed?.rss?.channel?.item || [];
  const items = Array.isArray(feedItems) ? feedItems : [feedItems];

  return items.map((item) => {
    const bookId = item.book_id || "";
    return {
      title: String(item.title || ""),
      author: item.author_name || item.author || "",
      link: bookId ? `https://www.goodreads.com/book/show/${bookId}` : item.link || "",
      cover: upscaleCover(item.book_image_url || item.image_url || ""),
      rating: Number(item.user_rating) || 0,
      dateAdded: item.user_date_added || item.pubDate || ""
    };
  }).filter((book) => book.title && book.link);
}

async function fetchShelf(userId, shelf) {
  const cacheKey = `${userId}:${shelf}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.items;

  const items = [];
  const seen = new Set();
  for (let page = 1; page <= 100; page += 1) {
    const endpoint = new URL(`https://www.goodreads.com/review/list_rss/${userId}`);
    endpoint.searchParams.set("shelf", shelf);
    endpoint.searchParams.set("page", page);
    endpoint.searchParams.set("per_page", "100");
    if (shelf === "read") {
      endpoint.searchParams.set("sort", "rating");
      endpoint.searchParams.set("order", "d");
    }
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Goodreads returned ${response.status}`);
    const pageItems = parseItems(await response.text());
    const eligibleItems = shelf === "read"
      ? pageItems.filter((item) => item.rating === 5)
      : pageItems;
    const newItems = eligibleItems.filter((item) => !seen.has(item.link));
    newItems.forEach((item) => seen.add(item.link));
    items.push(...newItems);
    if (pageItems.length < 100 || newItems.length === 0
      || (shelf === "read" && eligibleItems.length === 0)) break;
  }

  cache.set(cacheKey, { items, expires: Date.now() + cacheTtl });
  return items;
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function serveStatic(response, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = path.resolve(publicRoot, requested);
  if (!file.startsWith(`${publicRoot}${path.sep}`)) return json(response, 403, { error: "Forbidden" });
  fs.readFile(file, (error, content) => {
    if (error) return json(response, error.code === "ENOENT" ? 404 : 500, { error: "File not found" });
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".css") ? "text/css" : "text/javascript";
    response.writeHead(200, { "content-type": `${type}; charset=utf-8` });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/api/lists") {
    const userId = url.searchParams.get("userId");
    const shelf = url.searchParams.get("shelf");
    if (!/^\d+$/.test(userId || "") || !["read", "to-read"].includes(shelf)) {
      return json(response, 400, { error: "A numeric userId and read or to-read shelf are required." });
    }
    try {
      return json(response, 200, { items: await fetchShelf(userId, shelf) });
    } catch (error) {
      return json(response, 502, { error: "Unable to retrieve the Goodreads list." });
    }
  }
  serveStatic(response, url.pathname);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}, shutting down...`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close the server cleanly.", error);
      process.exitCode = 1;
      return;
    }
    console.log("Goodgifts shut down.");
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

server.listen(port, () => console.log(`Goodgifts listening on http://localhost:${port}`));
