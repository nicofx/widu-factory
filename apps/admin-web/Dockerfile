FROM node:20 AS build
WORKDIR /app
COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter admin-web build          # 👈 apunta a admin-web

FROM nginx:alpine
COPY --from=build /app/dist/apps/admin-web /usr/share/nginx/html
