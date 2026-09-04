# GoodGifts

A lightweight app for finding thoughtful book gifts from Goodreads profile IDs.
It matches "your" 5 star reads with "their" wishlist and returns the suggestions.

![goodgifts](assets/goodgifts-example.png)

> Goodreads itself has a friend bookshelf comparison feature, but it (currently) doesn't make it easy to do this directly.

## Technically

The app implements a backend Node.js process to serve the UI and proxy Goodreads RSS requests.
The backend is required to avoiding browser CORS restrictions .. a single page app can't call the goodreads directly.

The backend is not hosted anywhere for public use, as this may run foul of the Goodreads terms of service.
But if this app is something you may find useful, and you don't mind the technicalities of running it locally .. be my guest!

## Run with Docker

If you don't want to install or build anything, just run the [docker image](https://hub.docker.com/r/tardate/goodgifts):

```sh
docker run --rm -p 4173:4173 tardate/goodgifts
```

Open <http://localhost:4173> in a browser to use the app.
Stop the container with Ctrl-C when done.

## Build and Run Locally

Install dependencies and run locally with:

```sh
npm install
npm start
```

Open <http://localhost:4173> in a browser to use the app.
Stop the server with Ctrl-C when done.

## Build and Run with Docker

A [Dockerfile](./Dockerfile) is provided to package the app with Docker,
and a script [docker-control.sh](./docker-control.sh) to automate build, push, and run

e.g. to build and run:

```sh
./docker-control.sh build
./docker-control.sh run
```

Open <http://localhost:4173> in a browser to use the app.
Stop the container with Ctrl-C when done.

## Getting Goodreads Data

The public API has been retired, but the public RSS feeds are good enough e.g:

* To get "my" 5 star reads:
    * <https://www.goodreads.com/review/list_rss/17475014?shelf=read&sort=rating&order=d&page=1&per_page=100>
    * Note: filter by rating does not appear to work, so instead the read-shelf requests use `sort=rating&order=d` and stopping pagination when a page has no more five-star ratings.
* To get "their" wishlist:
    * <https://www.goodreads.com/review/list_rss/53698810?shelf=to-read&page=1&per_page=100>
    * stop pagination when a page has less than 100 entries.

These cannot be requested within the browser due to CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

The backend service parses the RSS with `fast-xml-parser`, fetches all pages (`per_page=100`) and caches each public shelf in memory for five minutes.
