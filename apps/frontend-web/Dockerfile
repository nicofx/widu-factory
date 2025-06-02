# apps/frontend-web/Dockerfile
FROM node:20 AS build

WORKDIR /app
COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter frontend-web build

# ----

FROM nginx:alpine

COPY --from=build /app/dist/frontend-web /usr/share/nginx/html
