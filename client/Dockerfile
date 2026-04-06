# Étape 1 : Build de l'application React
FROM node:20-slim AS build
WORKDIR /app

# On définit les variables d'argument pour qu'elles soient injectées au build
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_CLIENT_ID

# On les rend disponibles comme variables d'environnement pour le process de build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY client/package*.json ./
RUN npm install --legacy-peer-deps

COPY client/ ./
RUN npm run build

# Étape 2 : Serveur de production (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Configuration pour gérer le routing React (SPA)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]