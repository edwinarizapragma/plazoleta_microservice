FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
#RUN apk add --no-cache tzdata

#ENV TZ=America/Bogota

COPY . .

CMD [ "npm", "run", "start" ]