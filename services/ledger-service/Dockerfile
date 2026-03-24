FROM node:18

WORKDIR /app

COPY services/ledger-service/package*.json ./
RUN npm install

COPY shared ./shared
COPY services/ledger-service .

CMD ["node","index.js"]