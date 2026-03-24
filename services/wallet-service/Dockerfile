FROM node:18

WORKDIR /app

COPY services/wallet-service/package*.json ./
RUN npm install

COPY shared ./shared
COPY services/wallet-service .

EXPOSE 3001

CMD ["node","index.js"]