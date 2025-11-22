FROM node:20-alpine AS base

WORKDIR /app

# better-sqlite3 needs build tooling
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production

EXPOSE 4006

CMD ["node", "src/index.js"]
