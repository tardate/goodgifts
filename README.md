# goodgifts

A lightweight single-page prototype for finding thoughtful book gifts from Goodreads profile IDs.

Install dependencies and run locally with:

```sh
npm install
npm start
```

The Node.js service serves the UI and proxies Goodreads RSS requests, avoiding browser CORS restrictions. It parses the RSS with `fast-xml-parser`, fetches all pages (`per_page=100`) and caches each public shelf in memory for five minutes. Enter two numeric Goodreads profile IDs to match the first user's five-star reads against the second user's `to-read` shelf.

## Getting Goodreads Data

The public API has been retired, but RSS feeds are good enough e.g:

* To get "my" 5 star reads:
    * <https://www.goodreads.com/review/list_rss/17475014?shelf=read&sort=rating&order=d&page=1&per_page=100>
    * Note: filter by rating does not appear to work, so instead the read-shelf requests use `sort=rating&order=d` and stopping pagination when a page has no more five-star ratings.
* To get "their" wishlist:
    * <https://www.goodreads.com/review/list_rss/53698810?shelf=to-read&page=1&per_page=100>
    * stop pagination when a page has less than 100 entries.

These cannot be requested within the browser due to CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
