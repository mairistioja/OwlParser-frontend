FROM node:16-alpine AS builder
COPY . /owl/
RUN \
    cd /owl \
    && npm install \
    && npm run build 
RUN npm ls react-dom
RUN npm ls react-native

FROM nginx:latest
RUN sed -i "s/worker_processes\s*auto;/worker_processes 2;/g" /etc/nginx/nginx.conf
COPY --from=builder /owl/build /usr/share/nginx/html
