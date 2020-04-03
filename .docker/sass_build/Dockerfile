FROM centos:7

RUN yum update -y
RUN yum install -y wget zip unzip git

ARG SASS_VERSION='1.26.3'
ARG SASS_BINARY="dart-sass-${SASS_VERSION}-linux-x64.tar.gz"
RUN wget "https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/${SASS_BINARY}" -O /tmp/"${SASS_BINARY}"
RUN tar -C /usr/local -xzf /tmp/"${SASS_BINARY}"

ENV SASS_PATH=/usr/local/dart-sass
RUN echo 'export PATH=${PATH}:${SASS_PATH}' >> /etc/profile.d/mySass.sh
ENV PATH=${PATH}:${SASS_PATH}

ENV TZ=Asia/Tokyo
