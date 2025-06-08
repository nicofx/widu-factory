# apps/api-core/Dockerfile

FROM node:20

# 1) Copiamos todo el monorepo a /app
WORKDIR /app
COPY . .

# 2) Instalamos pnpm y dependencias del workspace
RUN npm install -g pnpm \
    && pnpm install

# 3) Vamos al directorio de api-core
WORKDIR /app/apps/api-core

# 4) Ejecutamos el build “docker” (tsconfig.json → dist/)
RUN pnpm build:docker

# 5) Copiamos configs (.json) a dist/apps/api-core/config
RUN cp -R config dist/apps/api-core/config

# 5b) Copiamos mail-templates a dist/apps/api-core/mail-templates
RUN cp -R mail-templates dist/apps/api-core/mail-templates
RUN cp -R mail-templates dist/apps/api-core/src/mail-templates

# 6) Exponemos puerto 3000
EXPOSE 3000

# 7) Ajustamos working dir para runtime
WORKDIR /app/apps/api-core

# 8) Arrancamos el binario compilado
CMD ["node", "dist/apps/api-core/src/main.js"]
