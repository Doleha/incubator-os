FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm exec tsc

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
EXPOSE 3300
CMD ["node", "dist/index.js"]
