FROM centos:7

RUN yum install epel-release -y;
RUN yum update -y;

COPY ./etc/yum.repos.d/nginx.repo /etc/yum.repos.d/nginx.repo
RUN yum install nginx -y;
COPY ./etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./etc/nginx/site_def/* /etc/nginx/site_def/
COPY ./etc/nginx/sites/* /etc/nginx/sites/
COPY ./var/www/html/error_pages/*.html /var/www/html/error_pages/

EXPOSE 80/tcp
EXPOSE 443/tcp

STOPSIGNAL SIGTERM

ENTRYPOINT ["nginx", "-g", "daemon off;"]
