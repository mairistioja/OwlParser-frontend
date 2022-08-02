FROM node:16-alpine AS builder
COPY . /owl/
RUN \
    cd /owl \
    && npm install \
    && npm run build \
    && sed -i "s/worker_processes\s*auto;/worker_processes 4;/g" /etc/nginx/nginx.conf

FROM nginx:latest
COPY --from=builder /owl/build /usr/share/nginx/html
