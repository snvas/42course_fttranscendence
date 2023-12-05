
FROM nginx:alpine AS production
USER root
COPY . /etc/nginx/
COPY default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
ENTRYPOINT [ "nginx", "-g", "daemon off;"]


