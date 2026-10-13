# syntax=docker/dockerfile:1.7
# Obraz frontendu: statyczna strona www (port 8080) i panel web (port 8081) w nginx bez roota.
# Adresy ustawia env kontenera: WWW_URL, PANEL_URL, API_BASE_URL, CONTACT_EMAIL.
ARG NODE_IMAGE=node:22.22.3-alpine3.24
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30.5-alpine3.24

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY . .
# Znaczniki zamiast adresów; nginx podmienia je w HTML (nginx/default.conf.template).
ENV VITE_API_BASE_URL=__EQ_API_BASE_URL__ \
    VITE_WWW_URL=__EQ_WWW_URL__ \
    VITE_PANEL_URL=__EQ_PANEL_URL__ \
    VITE_CONTACT_EMAIL=__EQ_CONTACT_EMAIL__
RUN npm run build

FROM ${NGINX_IMAGE} AS runtime
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/www /usr/share/nginx/www
COPY --from=build /app/dist/web /usr/share/nginx/web
ENV WWW_URL=http://localhost:8080 \
    PANEL_URL=http://localhost:8081 \
    API_BASE_URL=http://localhost:4010 \
    CONTACT_EMAIL=kontakt@equenor.example
EXPOSE 8080 8081
