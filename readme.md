# Chat App

Lightweight chat application built with Next.js (TypeScript) frontend, Express.js backend, MongoDB and Tailwind CSS. Uses yarn for package management and Socket.IO for real-time messaging.

## Tech stack
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Express.js + TypeScript + Socket.IO
- Database: MongoDB (Prisma ORM)
- Package manager: yarn
<!-- - Optional: Redis for pub/sub / presence, S3-compatible storage for file uploads -->
- Cloud Storage: Cloudinary

## Features
- Email authentication (JWT)
- One-to-one chat
- Real-time messaging (Socket.IO)
- Message history persisted in MongoDB
<!-- - Typing indicators and read receipts -->
- Online presence
<!-- - Message reactions and edits/deletes -->
- File/image upload and preview
- Basic search (users)
- Responsive UI with Tailwind CSS
- Basic notifications (in-app)
- Basic rate limiting and input validation

## Quick start
1. Clone repo
    yarn install

2. Create .env files for server and Next.js (example keys below)

3. Run in development
    yarn dev

4. Build and start
    yarn build
    yarn start


<!-- ## Example environment variables
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=supersecret
- NEXT_PUBLIC_BASE_URL=http://localhost:3000
- PORT=4000
- REDIS_URL=redis://localhost:6379 (optional)
- S3_BUCKET, S3_KEY, S3_SECRET (optional for uploads)

## Project layout (suggested)
- /client — Next.js app (pages/app, components, styles)
- /server — Express API (src/controllers, src/models, src/services, src/sockets)
- /shared — types and utilities shared across client/server
- /scripts — helper scripts (seed, migrate) -->

## API & realtime
- REST endpoints for auth, users, chats, messages
- Socket.IO namespace/rooms for real-time events:
  - connect/disconnect
  - message:create, message:edit, message:delete
  - typing:start/stop
  - presence:update

## Security & best practices
- Validate and sanitize inputs server-side
- Use HTTPS in production and secure JWT (httpOnly cookies or authorization header)
- Rate limiting and CORS configuration
- Limit file upload sizes and scan/validate file types
- Use environment-specific configs and secret management

## Deployment notes
- Build client: next build && next export (if static) or next start for SSR
- Build server: tsc && node dist/server.js
- Use process manager (PM2) or containerization (Docker)
- Use managed MongoDB (Atlas) and optionally Redis for scaling sockets

## Testing & linting
- Unit tests (Jest/React Testing Library)
- Linting: ESLint + Prettier
- Optional E2E: Playwright / Cypress

## Contributing
- Fork, create a branch, add tests, open PR
- Keep commits small and descriptive

## License
Specify a license (e.g. MIT)

---
This README is a starting template. Adapt scripts, env variables and folder structure to your project conventions.
