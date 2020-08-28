# engagedu/open-edx-auth-integration
FROM node:erbium-alpine
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm install
COPY ./ ./
EXPOSE 3000
CMD ["npm", "start"]
