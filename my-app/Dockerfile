FROM node:15.11.0-alpine as base

RUN apk update && apk upgrade
RUN apk add yarn

WORKDIR /data/my-app
COPY . .

RUN yarn install
RUN yarn build
ENV NODE_ENV production

EXPOSE 3000
CMD ["yarn", "start"]