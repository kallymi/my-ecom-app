# 1. On utilise une version de Node stable
FROM node:20-slim

# 2. On définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie uniquement les fichiers de dépendances pour aller vite
COPY package*.json ./

# 4. On installe les dépendances (sans les outils de dev comme nodemon)
RUN npm install --production

# 5. On copie le reste de ton code (server.js, etc.)
COPY . .

# 6. Ton serveur écoute sur un port (souvent 3000 ou 5000)
# Vérifie dans ton server.js quel port tu utilises
EXPOSE 3000

# 7. La commande pour lancer le serveur (celle de ton package.json)
CMD ["npm", "start"]