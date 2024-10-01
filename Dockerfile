FROM node:alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./
expose 4000
CMD ["npm", "start"]
