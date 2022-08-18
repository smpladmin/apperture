FROM node:16.17.0 as base

WORKDIR /code
COPY package*.json /
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
COPY . /
RUN npm ci --include=dev
RUN npm run build

CMD npm run start

FROM base as dev
ENV NODE_ENV=development
COPY . /
RUN npm install

CMD npm run dev
