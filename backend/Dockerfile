# ---- Stage 1: Build the application ----
FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies and copy source code
COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend
RUN yarn install && yarn prisma generate && yarn build

# ---- Stage 2: Run the application ----
FROM node:20-bullseye
WORKDIR /app
COPY --from=builder /app/backend ./
COPY --from=builder /app/shared ./shared
EXPOSE 5000
CMD ["yarn", "start"]
