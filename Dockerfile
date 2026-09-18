# Vitall static site on nginx. Railway injects $PORT; the official nginx image
# renders /etc/nginx/templates/*.template with envsubst at start-up, so the
# listen port follows it. Locally: docker run -e PORT=8080 -p 8080:8080 vitall
FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY site/ /usr/share/nginx/html/
ENV PORT=8080
EXPOSE 8080
