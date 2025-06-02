# apps/api-core/Dockerfile

FROM node:20

# 1) Copiamos todo el monorepo a /app
WORKDIR /app
COPY . .

# 2) Instalamos pnpm y dependencias de todo el workspace
RUN npm install -g pnpm && pnpm install

# 3) Vamos al directorio de api-core
WORKDIR /app/apps/api-core

# 4) Ejecutamos el build “normal” (tsconfig.json),
#    que creará dist/apps/api-core/src/main.js y todo lo compila en dist/
RUN pnpm build:docker

# 5) Copiamos los JSON de config (apps/api-core/config) a /app/apps/api-core/config
#    Ese es el único “postbuild” que necesitas
RUN cp -R config dist/apps/api-core/config

# 6) Exponemos el puerto
EXPOSE 3000

# 7) Cambiamos el directorio de trabajo para el runtime de Node:
#    a /app/apps/api-core, de modo que `process.cwd()` sea /app/apps/api-core
WORKDIR /app/apps/api-core

# 8) Arrancamos el binario compilado
CMD ["node", "dist/apps/api-core/src/main.js"]

# FROM node:20


# WORKDIR /app

# COPY . .

# RUN npm install -g pnpm && \
#     pnpm install

# WORKDIR /app/apps/api-core
# RUN pnpm build:docker && pnpm postbuild

# # 💥 FIX: apuntamos al path real del main.js
# CMD ["node", "dist/apps/api-core/src/main.js"]
