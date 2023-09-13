# syntax=docker/dockerfile:1

# Build Node.js app
# ------------------------------------
FROM node:18-alpine as build
WORKDIR /app
COPY ./package*.json ./
COPY ./packages/api ./packages/api
RUN npm ci --cache /tmp/empty-cache
RUN npm run build --workspace=api

# Run Node.js app
# ------------------------------------
FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY ./package*.json ./
COPY ./packages/api/package.json ./packages/api/
RUN npm ci --omit=dev --workspace=api --cache /tmp/empty-cache
COPY --from=build app/packages/api/dist packages/api/dist
EXPOSE 3000
CMD [ "npm", "start", "--workspace=api" ]
