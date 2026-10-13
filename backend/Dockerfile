# syntax=docker/dockerfile:1.7
# Jeden obraz backendu; serwis wybiera komenda, np. ["npm", "run", "start:auth"].
# Bez komendy kontener wypisuje dostępne skrypty (npm run).
ARG NODE_IMAGE=node:22.22.3-alpine3.24

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

FROM ${NODE_IMAGE} AS runtime
RUN apk add --no-cache tini
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_CACHE=/tmp/.npm
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Pliki należą do roota, proces działa jako node: system plików może być tylko do odczytu
# (zapis tylko w /tmp, np. tmpfs).
USER node
EXPOSE 8080 8081
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run"]
