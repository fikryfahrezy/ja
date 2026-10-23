FROM oven/bun:1.4.4-debian@sha256:93d5032fe06d163427822dc1598f420363759bb18155c9cc90eb1be05a64a19e AS build

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
