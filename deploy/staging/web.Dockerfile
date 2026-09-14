# syntax=docker/dockerfile:1.7
# Next.js 16 frontend. Build context is the repo root.
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# STRAPI_URL must be the PUBLIC https origin of the CMS: src/lib/cms/client.ts
# uses it both for fetches and to build browser-facing media URLs, and
# next.config.ts derives images.remotePatterns from it. `next build` prerenders
# every page from the live CMS, so that CMS must be reachable during the build.
ARG STRAPI_URL
# SITE_URL: this deployment's public origin (canonical URLs, sitemap, robots).
# SITE_INDEXABLE=true ONLY for production — anything else is noindex/Disallow.
ARG SITE_URL
ARG SITE_INDEXABLE=false
RUN test -n "$STRAPI_URL" || (echo "STRAPI_URL build arg is required" && exit 1)
RUN test -n "$SITE_URL" || (echo "SITE_URL build arg is required" && exit 1)
ENV STRAPI_URL=${STRAPI_URL} SITE_URL=${SITE_URL} SITE_INDEXABLE=${SITE_INDEXABLE} NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
# SITE_URL / SITE_INDEXABLE are read at RUNTIME too (ISR regeneration, on-demand
# pages, sitemap) — server-side env is not inlined by `next build`. Bake the
# same values into the runtime image so a regenerated page can never differ
# from a prerendered one (e.g. pick up noindex or a localhost canonical).
ARG SITE_URL
ARG SITE_INDEXABLE=false
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 SITE_URL=${SITE_URL} SITE_INDEXABLE=${SITE_INDEXABLE}
COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/next.config.ts /app/tsconfig.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"
CMD ["npx", "next", "start", "-p", "3000"]
