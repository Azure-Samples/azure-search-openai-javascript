# syntax=docker/dockerfile:1

# Build Node.js app
# ------------------------------------
FROM node:22-alpine as build
WORKDIR /app
COPY ./package*.json ./
COPY ./packages/indexer ./packages/indexer
RUN npm ci --cache /tmp/empty-cache
RUN npm run build --workspace=indexer

# Run Node.js app
# ------------------------------------
FROM node:22-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY ./package*.json ./
COPY ./packages/indexer/package.json ./packages/indexer/
RUN npm ci --omit=dev --workspace=indexer --cache /tmp/empty-cache
COPY --from=build app/packages/indexer/dist packages/indexer/dist
EXPOSE 3001
CMD [ "npm", "start", "--workspace=indexer" ]
