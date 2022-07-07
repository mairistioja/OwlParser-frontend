FROM node:16-alpine AS builder
COPY . /owl/
RUN \
    cd /owl \
    && npm install \
    && npm run build

FROM nginx:latest
COPY --from=builder /owl/build /usr/share/nginx/html
