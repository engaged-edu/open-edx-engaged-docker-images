# engagedu/open-edx-auth-integration
FROM node:erbium-alpine
WORKDIR /usr/app
COPY ./package.json ./yarn.lock ./
RUN yarn install --production
COPY ./src ./src
CMD ["yarn", "start"]
