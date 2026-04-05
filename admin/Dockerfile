# 1. Étape de Build (Node)
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./


RUN npm install --legacy-peer-deps

COPY . .
# On lance la commande build de ton package.json (Vite génère le dossier 'dist')
RUN npm run build

# 2. Étape de Production (Nginx)
FROM nginx:stable-alpine
# On copie les fichiers compilés du dossier 'dist' vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration pour éviter les erreurs 404 sur React quand on rafraîchit la page
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]