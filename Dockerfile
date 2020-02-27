FROM node:alpine
WORKDIR /code
COPY package*.json ./
RUN npm --silent install
COPY . .
RUN chmod +x start.sh
CMD ["sh", "start.sh"]