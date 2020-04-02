FROM centos:7

RUN yum update -y;
RUN yum install -y git;
RUN yum install -y make gcc bzip2 openssl-devel readline-devel zlib-devel;

ARG RUBY_VERSION='2.7.0'
ENV RBENV_ROOT /usr/local/rbenv
RUN git clone https://github.com/rbenv/rbenv.git "${RBENV_ROOT}" && \
    git clone https://github.com/rbenv/ruby-build.git "${RBENV_ROOT}/plugins/ruby-build";
ENV PATH /usr/local/rbenv/bin:${PATH}
RUN rbenv install ${RUBY_VERSION} && \
    rbenv global ${RUBY_VERSION} && \
    echo 'eval "$(rbenv init -)"' >> /etc/profile.d/rbenv.sh && \
    chmod 755 /etc/profile.d/rbenv.sh;
RUN eval "$(rbenv init -)" && \
    gem install sass sass-globbing --no-document;

ENV TZ=Asia/Tokyo
