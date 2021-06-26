FROM python:3.8-alpine

LABEL maintainer="Shreyas Dodamani <https://www.github.com/ShreyasTheOne/>"

ENV PYTHONUNBUFFERED 1

RUN addgroup --system batcave && adduser --system -G batcave batman

#RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev libffi-dev openssl-dev jpeg-dev zlib-dev libjpeg cargo

RUN pip install --upgrade pip \
    && pip install --upgrade setuptools \
    && pip install --upgrade pipenv \
    && pip install --upgrade supervisor

WORKDIR /rendezvous_backend

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

RUN mkdir -p /static \
    && chown -R batman:batcave /static \
    && chmod -R o+r /static

RUN mkdir -p /media \
    && chown -R batman:batcave /media \
    && chmod -R o+r /media

COPY . .
