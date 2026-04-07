# Étape 1 : Build
FROM node:20-slim AS build
WORKDIR /app

# CRUCIAL : Déclarer l'argument pour Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . ./
# Vite va injecter VITE_API_URL pendant cette commande
RUN npm run build

# Étape 2 : Nginx
FROM nginx:stable-alpine
# Attention : Avec Vite, le dossier de sortie est souvent 'dist', pas 'build'
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]