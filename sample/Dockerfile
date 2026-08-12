FROM node:20

WORKDIR /usr/src/app

COPY package.json

RUN npm install

COPY . .

ARG APP_PORT=3000

ENV APP_PORT=${APP_PORT}

RUN npm run build

EXPOSE 

CMD ["node", "dist/main"]