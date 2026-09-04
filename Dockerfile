FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node app.js index.html server.js styles.css ./

ENV NODE_ENV=production
ENV PORT=4173

USER node

EXPOSE 4173

CMD ["node", "server.js"]
