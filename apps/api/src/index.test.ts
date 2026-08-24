import { expect, test } from "bun:test";
import { blobatar } from "blobatar/blob";
import worker from "./index";

// The standalone entry. With no site behind it, the question this answers is
// what a deployment of `apps/api` does off the avatar path.

const ORIGIN = "https://blobatar-api.example.workers.dev";
const fetchIt = (path: string) => worker.fetch(new Request(ORIGIN + path));

test("/avatar/ reaches the renderer", async () => {
  expect(await fetchIt("/avatar/alain").text()).toBe(blobatar("alain"));
});

test("/seeded/<seed> is a deterministic alias for /avatar/<name>", async () => {
  expect(await fetchIt("/seeded/alain?gen=1").text())
    .toBe(await fetchIt("/avatar/alain?gen=1").text());
});

test("/random renders an image and is never cached", async () => {
  const res = fetchIt("/random?size=64");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
  expect(res.headers.get("cache-control")).toBe("no-store");
});

test("/docs serves the Scalar OpenAPI reference", async () => {
  const res = fetchIt("/docs");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
  expect(res.headers.get("content-security-policy")).toContain("cdn.jsdelivr.net");
  expect(await res.text()).toContain("@scalar/api-reference@1.66.1");
});

test("the root documents the endpoint", async () => {
  const res = fetchIt("/");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
  expect(await res.text()).toContain("GET /avatar/<name>");
});

test("anything else is a 404 that still says how to use it", async () => {
  for (const path of ["/avatars", "/avatar.svg", "/favicon.ico"]) {
    const res = fetchIt(path);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("GET /avatar/<name>");
  }
});
