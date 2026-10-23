FROM oven/bun:1.4.3-debian@sha256:923bedb355f7746666659f71e724998159a5c8c54bd1cb1030e1975a0698415b AS build

WORKDIR /app

ENV CI=true
COPY package.json bun.lock bunfig.toml ./
# Nuxt preparation needs the application source, which is copied below.
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run build

FROM nginx:1.31.8-trixie AS runtime

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS -o /dev/null http://127.0.0.1/ || exit 1
