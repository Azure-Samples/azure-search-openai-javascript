# syntax=docker/dockerfile:1

# Build Node.js app
# ------------------------------------
FROM node:18-alpine as build
WORKDIR /app
COPY ./package*.json ./
COPY ./packages/ingestion ./packages/ingestion
RUN npm ci --cache /tmp/empty-cache
RUN npm run build --workspace=ingestion

# Run Node.js app
# ------------------------------------
FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY ./package*.json ./
COPY ./packages/ingestion/package.json ./packages/ingestion/
RUN npm ci --omit=dev --workspace=ingestion --cache /tmp/empty-cache
COPY --from=build app/packages/ingestion/dist packages/ingestion/dist
EXPOSE 3000
CMD [ "npm", "start", "--workspace=ingestion" ]
