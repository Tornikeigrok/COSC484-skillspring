# 484gp-server

## Setup

1. Install dependencies
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your local values
   ```
   cp .env.example .env
   ```
3. Make sure Postgres is running locally and the database named in `DB_NAME` exists
4. Start the dev server
   ```
   npm run dev
   ```

5. For migrations, there is a script in package.json -> npm run db:migrate
Server runs on the port set in `SERVER_PORT`
