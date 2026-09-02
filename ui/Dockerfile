FROM node:alpine AS builder

RUN npm install -g yarn

COPY yarn.lock package.json ./

RUN yarn
COPY . .
RUN yarn build

FROM node:alpine

RUN npm install -g yarn

ENV JAM_CONFIG_DIR=/jam-config

RUN mkdir /app
WORKDIR /app

COPY public ./public/
COPY server ./server/
COPY server-package.json package.json
COPY --from=builder /public/js ./public/js/
COPY --from=builder /public/css/tailwind.css ./public/css
RUN yarn

CMD node server/bin/www.js

EXPOSE 3000
