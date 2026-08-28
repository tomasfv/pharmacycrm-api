# 1. Image base: Node 22 en Alpine (Alpine = Linux liviano, ~5MB)
FROM node:22-alpine

# 2. Working directory: dónde vamos a trabajar DENTRO del contenedor
WORKDIR /app

# 3. Copiamos package.json primero (truco para aprovechar cache de Docker)
#    Si no cambiás dependencias, Docker reutiliza la capa anterior
COPY package.json package-lock.json ./

# 4. Instalamos dependencias (todas, incluyendo dev para compilar TS)
RUN npm ci

# 5. Copiamos TODO el código fuente
COPY . .

# 6. Compilamos TypeScript a JavaScript
RUN npm run build

# 7. Exponemos el puerto (documentación, no abre nada realmente)
EXPOSE 4000

# 8. El comando que se ejecuta cuando arranca el contenedor
CMD ["node", "dist/server.js"]