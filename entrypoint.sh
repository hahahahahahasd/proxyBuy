#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Run database migrations and seeding
echo "Running database push and seed..."
npx prisma db push --force-reset
node dist/prisma/seed.js

# 2. Start the application using PM2 in cluster mode
# The 'exec' command is important to ensure that PM2 becomes the main process (PID 1)
# which allows it to receive signals like SIGINT/SIGTERM correctly from Docker.
echo "Starting application with PM2..."
exec pm2-runtime start dist/main.js --name payer-backend -i ${cpu_count:-0}