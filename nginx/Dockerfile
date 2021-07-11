FROM nginx:alpine

LABEL maintainer="Shreyas Dodamani <https://www.github.com/ShreyasTheOne/>"

WORKDIR /etc/nginx

RUN mkdir ssl/

RUN rm -f ./conf.d/default.conf

ADD ./conf.d ./conf.d
