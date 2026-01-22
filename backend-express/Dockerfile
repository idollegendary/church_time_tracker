FROM node:18-alpine

WORKDIR /app

COPY package.json /app/
RUN npm install --production

COPY . /app

ENV PORT=8000
EXPOSE 8000

CMD ["node", "src/index.js"]
