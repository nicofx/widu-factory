#!/bin/bash
echo "🛠 Bootstrapping WiduFactory..."
cp config/.env.dev .env
docker-compose -f docker-compose.yml -f docker/docker-compose.override.dev.yml up --build
