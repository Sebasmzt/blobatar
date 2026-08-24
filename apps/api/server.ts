import { serve } from "bun";
import worker from "./src/index";

const port = Number(process.env.PORT ?? 3000);
const documentation = Bun.file(new URL("./public/index.html", import.meta.url));

const server = serve({
  hostname: "0.0.0.0",
  port,
  fetch(request) {
    if (new URL(request.url).pathname === "/") {
      return new Response(documentation, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return worker.fetch(request);
  },
});

console.log(`blobatar API listening on ${server.url} (port ${port})`);
