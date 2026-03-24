FROM node:18

WORKDIR /app

COPY services/api-gateway/package*.json ./
RUN npm install

COPY services/api-gateway .

EXPOSE 3000

CMD ["node","index.js"]