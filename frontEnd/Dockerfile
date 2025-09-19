FROM nginx:latest
EXPOSE 80
COPY frontEnd/dist /var/www/html
COPY frontEnd/default.conf /etc/nginx/conf.d/default.conf
CMD nginx -g "daemon off;"