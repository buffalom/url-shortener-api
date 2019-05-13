FROM node:10.13.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get install -y curl

EXPOSE 3000
CMD [ "npm", "start" ]
