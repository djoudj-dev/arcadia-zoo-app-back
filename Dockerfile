FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build && \
    mkdir -p /app/uploads/animals /app/uploads/habitats /app/uploads/services

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
