FROM node:latest
WORKDIR /code
COPY package*.json ./
RUN npm --silent install
COPY . .
RUN chmod +x start.sh
CMD ./start.sh