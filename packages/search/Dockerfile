# syntax=docker/dockerfile:1

# Build Node.js app
# ------------------------------------
FROM node:22-alpine as build
WORKDIR /app
COPY ./package*.json ./
COPY ./packages/search ./packages/search
RUN npm ci --cache /tmp/empty-cache
RUN npm run build --workspace=search

# Run Node.js app
# ------------------------------------
FROM node:22-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY ./package*.json ./
COPY ./packages/search/package.json ./packages/search/
COPY ./packages/search/data/employee-info.csv ./packages/search/data/employee-info.csv
RUN npm ci --omit=dev --workspace=search --cache /tmp/empty-cache
COPY --from=build app/packages/search/dist packages/search/dist
EXPOSE 3000
CMD [ "npm", "start", "--workspace=search" ]
