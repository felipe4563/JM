FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
# Las fotos se guardan en /app/uploads (volumen de Docker, no dentro de la imagen)
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
