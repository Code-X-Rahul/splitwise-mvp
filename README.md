# express-sequelize-boilerplate

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)

This is a simple boilerplate for building REST APIs in Node.js using Express. Intended for use with PostgreSQL using Sequelize ORM.



## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://yarnpkg.com/)

## Project Setup

Follow these steps in order to get the project running locally.

### 1. Clone the repository

```bash
git clone https://github.com/Code-X-Rahul/splitwise-mvp.git
cd splitwise-mvp/
```

### 2. Start the PostgreSQL database

Spin up a Postgres 16 container using the included `docker-compose.yml`:

```bash
docker compose up -d
```

This starts a PostgreSQL instance on **port 5432** with the following defaults:

| Variable | Value |
| --- | --- |
| `POSTGRES_USER` | `splitwise_mvp` |
| `POSTGRES_PASSWORD` | `splitwise_mvp` |
| `POSTGRES_DB` | `splitwise_mvp_dev` |

> **Tip:** Verify the container is running with `docker ps`.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in values matching the Docker Compose config:

```env
# EXPRESS
SERVER_PORT=8000

# ENVIRONMENT
NODE_ENV=development

# JWT
SERVER_JWT=true
SERVER_JWT_SECRET=your_jwt_secret_here
SERVER_JWT_TIMEOUT=24h

# DATABASE (must match docker-compose.yml)
DB_DIALECT=postgres
DB_HOST=localhost
DB_USER=splitwise_mvp
DB_PASS=splitwise_mvp
DB_NAME=splitwise_mvp_dev
```

### 4. Install dependencies

```bash
yarn
```

### 5. Run database migrations

```bash
yarn sequelize db:migrate
```

### 6. Start the dev server

```bash
yarn dev
```

The API will be available at `http://localhost:8000` (or whichever port you set in `.env`).

## Configuration

Variables for the environment

| Option | Description |
| ------ | ------ |
| SERVER_PORT | Port the server will run on |
| NODE_ENV | development or production |
| SERVER_JWT | true or false |
| SERVER_JWT_SECRET | JWT secret |
| SERVER_JWT_TIMEOUT | JWT duration time |
| DB_DIALECT | "mysql", "postgresql", among others |
| DB_HOST | Database host |
| DB_USER | Database username |
| DB_PASS | Database password |
| DB_NAME | Database name |
| MAILTRAP_USERNAME | Mailtrap username |
| MAILTRAP_PASSWORD | Mailtrap password |
| MAILTRAP_HOST | Mailtrap host |
| SMTP_PORT | SMTP port |
| SMTP_FROM | SMTP from |

## Commands for sequelize 
```bash
# Creates the database
yarn sequelize db:create 

# Drops the database
yarn sequelize db:drop 

# Load migrations
yarn sequelize db:migrate 

# Undo migrations
yarn sequelize db:migrate:undo:all 

# Load seeders
yarn sequelize db:seed:all
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)



<h5 align="center">
  ☕ Code and Coffee
</h5>
