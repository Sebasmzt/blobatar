FROM oven/bun:1.4.0-slim

WORKDIR /app

# Install API dependencies from its standalone package manifest.
COPY apps/api/package.json ./package.json
RUN bun install --production

COPY apps/api/src ./src
COPY apps/api/server.ts ./server.ts
COPY apps/api/public ./public

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

USER bun
CMD ["bun", "run", "server.ts"]
