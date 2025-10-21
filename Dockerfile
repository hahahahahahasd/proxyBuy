# --- STAGE 1: Base Dependencies ---
# Install dependencies for the entire monorepo (workspaces)
FROM node:20-bullseye AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
# Copy package.json for both frontend and backend to ensure workspaces are detected
COPY packages/backend/package.json ./packages/backend/
COPY packages/customer-app/package.json ./packages/customer-app/
RUN npm install --legacy-peer-deps

# --- STAGE 2: Frontend Builder ---
# Build the customer-app (Vue frontend)
FROM base AS frontend-builder
WORKDIR /usr/src/app
# Copy frontend source code
COPY packages/customer-app ./packages/customer-app
# Build the frontend app
# Force rebuild by adding a comment with a timestamp: 2025-10-21 08:30:17
RUN npm run build -w packages/customer-app

# --- STAGE 3: Backend Builder ---
# Build the NestJS backend
FROM base AS backend-builder
WORKDIR /usr/src/app
# Copy backend source code and prisma schema
COPY packages/backend ./packages/backend
COPY packages/backend/src/prisma ./prisma
# Generate Prisma client
RUN npx prisma generate
# Build the backend app
RUN npm run build -w packages/backend

# --- STAGE 4: Production ---
# This is the final, lean image that will be run
FROM node:20-bullseye AS production
WORKDIR /usr/src/app
# Copy production dependencies from the base stage
COPY --from=base /usr/src/app/package.json /usr/src/app/package-lock.json ./
COPY --from=base /usr/src/app/packages/backend/package.json ./packages/backend/
COPY --from=base /usr/src/app/node_modules ./node_modules
# Copy the compiled backend code from the backend-builder stage
COPY --from=backend-builder /usr/src/app/packages/backend/dist ./dist
# The prisma schema file is needed at runtime
COPY --from=backend-builder /usr/src/app/prisma ./prisma
# Copy the built frontend assets from the frontend-builder stage into the public directory
COPY --from=frontend-builder /usr/src/app/packages/customer-app/dist ./public
# Copy entrypoint and wait-for-it scripts
COPY ./entrypoint.sh ./
COPY ./wait-for-it.sh ./
# Grant execution permissions
RUN chmod +x ./entrypoint.sh ./wait-for-it.sh

# Install PM2 process manager globally
RUN npm install pm2 -g

EXPOSE 3000

# Set the entrypoint script to be executed when the container starts
ENTRYPOINT ["./entrypoint.sh"]
