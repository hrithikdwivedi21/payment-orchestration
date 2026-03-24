FROM node:18

WORKDIR /app

COPY services/payment-service/package*.json ./
RUN npm install

COPY shared ./shared
COPY services/payment-service .

EXPOSE 3002

CMD ["node","index.js"]