# goodgifts

A lightweight single-page prototype for finding thoughtful book gifts from Goodreads profile IDs.

Run locally with:

```sh
npm start
```

The Node.js service serves the UI and proxies Goodreads RSS requests, avoiding browser CORS restrictions. It fetches all pages (`per_page=100`) and caches each public shelf in memory for five minutes. Enter two numeric Goodreads profile IDs to match the first user's five-star reads against the second user's `to-read` shelf.

## Getting Goodreads Data

The public API has been retired, but RSS feeds are good enough e.g:

* <https://www.goodreads.com/review/list_rss/17475014?shelf=read&sort=rating&order=d&page=1&per_page=100> - returns 5 stars first. NB: filter by rating does not appear to work
* <https://www.goodreads.com/review/list_rss/53698810?shelf=to-read&page=1&per_page=100>

These cannot be requested within the browser due to CORS restrictions:

```js
const response = await fetch('https://www.goodreads.com/review/list_rss/17475014?shelf=read');
(index):1 Access to fetch at 'https://www.goodreads.com/review/list_rss/17475014?shelf=read' from origin 'http://[::]:4173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
VM46:1  GET https://www.goodreads.com/review/list_rss/17475014?shelf=read net::ERR_FAILED 200 (OK)
```
