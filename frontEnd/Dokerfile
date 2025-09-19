FROM    nginx:latest
EXPOSE  80
COPY    ./dist /var/www/html
COPY    ./default.conf /etc/nginx/conf.d/default.conf
CMD     nginx -g "daemon off;"