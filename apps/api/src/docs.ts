import { SPEC_PATH } from "./openapi";

export const DOCS_PATH = "/docs";

const SCALAR_CDN =
  "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.66.1";

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <title>blobatar API Reference</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <script id="api-reference" data-url="${SPEC_PATH}"></script>
    <script src="${SCALAR_CDN}"></script>
  </body>
</html>`;

/** Scalar renders the OpenAPI document from this deployment's own origin. */
export const docs = () =>
  new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "content-security-policy":
        "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self'; worker-src blob:",
      "x-content-type-options": "nosniff",
    },
  });
