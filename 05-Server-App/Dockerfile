FROM node:16-alpine

COPY . /src

WORKDIR /src

RUN npm install --production

EXPOSE 3010

CMD ["node", "./bin/www"]