# Rendezvous Meetings

Rendezvous (find [here](https://rendezvous.eastus.cloudapp.azure.com/))  is a web-application on which people can connect with others around the world through video calls. It uses *native* WebRTC technology to form the peer connections.

This project was built during the coding phase of [Microsoft Engage 2021](https://microsoft.acehacker.com/engage2021/)

## Table of Contents
- [Setup instructions](#a)
    - [Database](#aa)
	- [Django](#ab)
	- [React](#ac)
	- [NGINX](#ad)
- [Technological Stack](#b)
- [Directory Structure](#c)
- [Features](#d)
- [Contact Me](#e)
- [License](#f)

## <a name='a'></a> Setup Instructions
Setting up the application is made extremely simple with the help of Docker. For both development and production environments, the code-base is exactly the same, and setup is _almost_ the same - production setup having one extra step. The project consists of 3 or 4 docker containers running, which is orchestrated by docker-compose.

### <a name='aa'></a> Database
The database is a PostgreSQL container. In `postgres/`, copy  `database-stencil.env`  to  `database.env`  and populate the environment variables. These will be used as the name and credentials to the database when the container starts up.

These will be the same credentials enterd in the Django configuration file.

### <a name='ab'></a> Backend
In `/backend/configuration/` copy the `config-stencil.env` file to `config.env` and fill in **ALL** the correct values. For more information on the backend directory structure and configuration, click [here](./backend/README.md)

### <a name='ac'></a> Frontend
In `/frontend/src/configuration/` copy the `config-stencil.json` file to `config.json` and fill in **ALL** the correct values. For more information on the frontend directory structure and configuration, click [here](./frontend/README.md)
<br>

> All steps till now are common to setting up both development as well as production environments. The next step is unique to the production environment, where we set up a reverse-proxy server

### <a name='ad'></a> NGINX
Once you generate the SSL certificate and private key for your server, place them in folder `/nginx/ssl/` with these exact names:
- `certificate.crt`
- `certificate.prv`

### Starting the servers
Once the configuration is complete, run one of the following commands in `/` to start the server:
- For development:
	- `docker-compose -f rendezvous_build/development.yml up`
- For production:
	- `docker-compose -f rendezvous_build/production.yml up`
- In the above commands, use the flag `-d` to run in detached mode (preferable in production).

## <a name='b'></a> Technological Stack

| Purpose | Technology |  
| - | - |  
| Backend Framework | `Django` |
| Message Broker | `Redis` |
| Task Queue | `Celery` |
| Frontend Library | `React` |
| Application State Management | `Redux` |
| UI Components | `Semantic UI` |
| Database | `PostgreSQL` |
| Containerisation | `Docker` |
| Orchestration | `Docker Compose` |

## <a name='c'></a> Directory Structure
```bash
├── backend
├── frontend
├── nginx
├── postgres
├── README.md
└── rendezvous_build
```

- `/backend` contains the Dockerfile and code for the Rendezvous Django project.
- `/frontend` contains the Dockerfile and code for the frontend in React.
- `/nginx` contains the Dockerfile configuration files, and SSL certificates for the NGINX server.
- `/postgres` contains the configuration file for the database
- `/rendezvous_build` contains the `YAML` files used by docker-compose while starting the development or production server.

## <a name='d'></a> Features


## <a name='e'></a> Contact Me
If you have any queries, or suggestions for the project, feel free to [reach out to me](mailto:shreyurd@gmail.com?subject=[Github]%20Rendezvous%20Feedback)
at shreyurd@gmail.com.

