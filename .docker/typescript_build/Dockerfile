FROM centos:7

RUN yum update -y;
RUN yum install -y git;

ARG NODEJS_VERSION='v12.16.1'
RUN mkdir /usr/local/nvm && \
    chmod 755 /usr/local/nvm && \
    git clone https://github.com/creationix/nvm.git /usr/local/nvm;
RUN source /usr/local/nvm/nvm.sh && \
    nvm install "${NODEJS_VERSION}" && \
    nvm use "${NODEJS_VERSION}" && \
    echo 'source /usr/local/nvm/nvm.sh; ' >> /etc/profile.d/nvm.sh && \
    chmod 755 /etc/profile.d/nvm.sh;
RUN source /usr/local/nvm/nvm.sh && \
    npm install typescript --global;

RUN mkdir -p /.config && chmod 777 /.config

ENV TZ=Asia/Tokyo
