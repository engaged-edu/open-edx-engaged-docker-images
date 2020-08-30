# engagedu/open-edx-auth-integration
FROM node:erbium-alpine
WORKDIR /usr/app
COPY ./package*.json ./yarn.lock ./
RUN yarn install
COPY ./ ./
EXPOSE 3000
CMD ["yarn", "start"]
