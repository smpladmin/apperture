FROM node:16.17.0-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /code
ENV PORT=3000
EXPOSE 3000

FROM base AS deps
WORKDIR /code
COPY package*.json /code/
RUN npm ci --include=dev

FROM base as builder
WORKDIR /code
COPY --from=deps /code/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
WORKDIR /code
ENV NODE_ENV=production
COPY --from=builder /code/public ./public
COPY --from=builder /code/.next/standalone ./
COPY --from=builder /code/.next/static ./.next/static
RUN npm i -g @beam-australia/react-env
ENTRYPOINT react-env --path ./.env --prefix NEXT_APP -- node server.js

FROM base as dev
WORKDIR /code
ENV NODE_ENV=development
COPY --from=deps /code/node_modules ./node_modules
COPY . .
CMD npm run dev
