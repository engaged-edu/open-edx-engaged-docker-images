# engagedu/open-edx-mysql-source-connector
FROM node:erbium-alpine
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm install
COPY ./ ./
CMD ["npm", "start"]
