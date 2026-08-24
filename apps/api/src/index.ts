import { PREFIX, avatar, notFound, usage } from "./avatar";
import { DOCS_PATH, docs } from "./docs";
import { SPEC_PATH, spec } from "./openapi";

const RANDOM_PATH = "/random";
const SEEDED_PREFIX = "/seeded/";

function rewrite(request: Request, pathname: string): Response {
  const url = new URL(request.url);
  url.pathname = pathname;
  return avatar(new Request(url, request));
}

function random(request: Request): Response {
  const url = new URL(request.url);
  const seed = crypto.randomUUID();
  url.pathname = `${PREFIX}${encodeURIComponent(seed)}`;

  const response = rewrite(request, url.pathname);
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  if (response.ok) {
    headers.set("x-blobatar-seed", seed);
    headers.set("access-control-expose-headers", "x-blobatar-seed");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * The endpoint on its own.
 *
 * This is what the Deploy to Cloudflare button publishes: one Worker, no
 * assets, no custom domain, answering avatar routes on a `workers.dev`
 * subdomain until its owner points a hostname at it.
 *
 * `apps/site` runs the same `avatar` behind the blobatar.dev asset pipeline, so
 * the two deployments differ in exactly one place — what happens off the avatar
 * paths. There it is the landing page; here there is nothing else to serve, so
 * the help text stands in for it rather than leaving a bare 404 for somebody who
 * has just deployed this and typed the hostname into a browser to see if it
 * worked.
 *
 * `/openapi.json` is the exception that proves the rule: it is the same
 * document on both, generated from the same parser, and served here from the
 * deployment's own origin so that a client generated against a fork calls the
 * fork rather than blobatar.dev.
 */
export default {
  fetch(request: Request): Response {
    const { pathname } = new URL(request.url);
    if (pathname === RANDOM_PATH) return random(request);
    if (pathname.startsWith(SEEDED_PREFIX)) {
      return rewrite(request, `${PREFIX}${pathname.slice(SEEDED_PREFIX.length)}`);
    }
    if (pathname.startsWith(PREFIX)) return avatar(request);
    if (pathname === DOCS_PATH || pathname === `${DOCS_PATH}/`) return docs();
    if (pathname === SPEC_PATH) return spec(request);
    // 404 everywhere but the root: a typo'd path is still a mistake, and
    // answering 200 to all of them would let one get cached and shared. The
    // 404 carries the usage text for a person and the error envelope for a
    // caller that asked for JSON — see `notFound`.
    return pathname === "/" ? usage(200) : notFound(request);
  },
};
