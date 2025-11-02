# ---- Stage 1: Build the application ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies and copy source code

COPY client ./client
COPY shared ./shared

WORKDIR /app/client
RUN  yarn install && yarn build


# ---- Stage 2: Run the application ----

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/client ./
COPY --from=builder /app/shared ./shared
EXPOSE 3000
CMD [ "yarn" , "start" ]