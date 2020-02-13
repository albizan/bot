FROM node:latest
WORKDIR /code
COPY package*.json ./
RUN npm install
RUN npm i -g knex
# RUN npm ci --only=production
COPY . .
CMD node index.js
