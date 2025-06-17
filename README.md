🐘 WiduApp Template
Este proyecto es un clon funcional de WiduFactory, pensado como base para construir nuevas aplicaciones con arquitectura modular, pipelines interpretativos y servicios integrados (Mongo, Redis, NestJS y Angular 19).

🚀 ¿Cómo levantar la app?
Desde consola, simplemente corré:

```bash docker compose up --build ```

Esto levanta:

🧠 Backend (NestJS) en `localhost:3000`
🌐 Frontend (Angular) en `localhost:4200`
🍃 MongoDB en `localhost:27017` (vacía, nueva)
🔥 Redis en `localhost:6379`
🛠️ Estructura básica
``` apps/ ├── api-core/ → Backend NestJS ├── frontend-web/ → Frontend Angular ├── config/ → Variables de entorno ├── docker-compose.yml ```

✨ ¿De dónde viene esto?
Este proyecto fue generado a partir de WiduFactory, el sistema madre.
Si querés crear tu propia app desde cero, podés usar el script la cli de widu ;)

🐘 Hecho con cariño por WiduIT
Memoria, fuerza y ternura digital para construir tus ideas.