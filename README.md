# SDEdit

SDEdit is a community discussion platform with a Next.js frontend and an Express/Prisma backend. Users can register, log in, browse a protected feed, create and join communities, publish image posts, comment on posts, and vote on posts or comments.

## Project Structure

```text
Project-5/
  sdedit/           # Next.js frontend
  sdedit_backend/   # Express API, Prisma, PostgreSQL
```

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, React Icons
- Backend: Node.js, Express 5, Prisma 7, PostgreSQL
- Auth: JWT stored in an HTTP-only cookie
- Uploads: Multer image uploads served from `/uploads`

## Prerequisites

- Node.js
- npm
- PostgreSQL database

## Backend Setup

```bash
cd sdedit_backend
npm install
```

Create a `.env` file in `sdedit_backend`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-secure-secret"
JWT_EXPIRE="1"
CLIENT_URL="http://localhost:3000"
BASEURL="http://localhost:5000/"
PORT=5000
NODE_ENV="development"
```

Prepare Prisma and the database:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The API health route should respond at:

```text
http://localhost:5000/
```

## Frontend Setup

```bash
cd sdedit
npm install
```

Create a `.env.local` file in `sdedit`:

```env
NEXT_PUBLIC_URL="http://localhost:5000/sdedit"
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Main Features

- Landing page with product sections and static visual assets
- User registration, login, session check, and logout
- Protected dashboard layout
- Feed and posts pages
- Community discovery and community creation
- Community membership
- Image post creation inside a community
- Post voting with upvote/downvote toggle behavior
- Comment creation and backend support for nested replies

## Useful Scripts

Frontend:

```bash
cd sdedit
npm run dev
npm run build
npm run start
npm run lint
```

Backend:

```bash
cd sdedit_backend
npm run dev
npx prisma generate
npx prisma migrate dev
```

## Documentation

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for architecture details, API route notes, data model summaries, environment variables, and development guidance.
