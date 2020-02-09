FROM node:latest
WORKDIR /code
COPY package*.json ./
RUN npm install
RUN npm ci --only=production
COPY . .
EXPOSE 80
CMD node index.js
