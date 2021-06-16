FROM node:stretch-slim as react-build

LABEL maintainer="Shreyas Dodamani <https://www.github.com/ShreyasTheOne/>"

RUN groupadd --system react && useradd --system --gid react react

WORKDIR /rendezvous_frontend
COPY . ./

RUN npm install
