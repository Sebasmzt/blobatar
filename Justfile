# Run `just` or `just list` to see available recipes.

default:
    @just --list

list:
    @just --list

install:
    bun install

# Install dependencies, then start the repository's existing development flow.
dev: install
    bun run dev

api: install
    bun run api

site: install
    bun run site

build: install
    bun run build

test: install
    bun test

docker-build:
    docker build --pull -t blobatar-api .

docker-run:
    docker run --rm -p 3000:3000 blobatar-api

clean:
    rm -rf node_modules apps/*/node_modules packages/*/node_modules
    rm -rf dist out .turbo .wrangler apps/*/dist apps/*/out apps/*/.wrangler packages/*/dist packages/*/out
    rm -rf apps/site/public/r
    rm -f apps/site/favicon.svg apps/site/*.html apps/site/public/llms.txt apps/site/public/openapi.json apps/site/public/sitemap.xml
