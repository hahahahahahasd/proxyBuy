#!/bin/sh
# entrypoint.sh

# Wait for the database to be ready
echo "Waiting for postgres to be fully available..."

# Use pg_isready to check the status of the PostgreSQL server.
# The hostname 'postgres' is the service name from docker-compose.yml.
# We loop until the command succeeds.
while ! pg_isready -h postgres -p 5432 -q -U user; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - proceeding with database setup..."

# Run Prisma migrations and seed the database
# These commands will now only run when the database is guaranteed to be ready.
npx prisma db push --accept-data-loss
npx prisma db seed

>&2 echo "Database setup complete. Starting application..."

# Execute the main command passed to the script (e.g., "node dist/main")
exec "$@"
