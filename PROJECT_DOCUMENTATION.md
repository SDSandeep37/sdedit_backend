# SDEdit Project Documentation

## Overview

SDEdit, short for Smart Dynamic Environment for Dialogue, Interaction & Thought, is a Reddit-style community platform. The application is split into two projects:

- `sdedit`: Next.js frontend application.
- `sdedit_backend`: Express API server with Prisma and PostgreSQL.

The product flow is:

1. A visitor opens the landing page.
2. The visitor registers or logs in.
3. The backend creates a JWT and stores it in an HTTP-only `token` cookie.
4. Authenticated users access the dashboard, feed, communities, posts, voting, and comments.

## Frontend

Location: `sdedit`

### Frameworks and Libraries

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- React Icons

### Important Files

- `app/page.tsx`: Public landing page.
- `app/layout.tsx`: Root layout.
- `Contexts/AuthContext.tsx`: Session lookup and authenticated user context.
- `app/user/layout.tsx`: Protected dashboard layout.
- `app/user/page.tsx`: Main feed.
- `app/user/posts/page.tsx`: Posts listing page.
- `app/user/communities/page.tsx`: Communities page and community creation form.
- `app/user/communities/[id]/create-post/page.tsx`: Create post page for a community.
- `app/Components/PostCard/PostCard.tsx`: Post UI, voting, and comment submission.
- `app/Components/CreateCommunityForm/CreateCommunityForm.tsx`: Community creation.
- `app/Components/CreateCommunityPostForm/CreateCommunityPostForm.tsx`: Image post creation.

### Frontend Environment

Create `sdedit/.env.local`:

```env
NEXT_PUBLIC_URL="http://localhost:5000/sdedit"
```

`NEXT_PUBLIC_URL` must include the backend route prefix because the frontend calls paths such as:

- `${NEXT_PUBLIC_URL}/user/login`
- `${NEXT_PUBLIC_URL}/post`
- `${NEXT_PUBLIC_URL}/community`
- `${NEXT_PUBLIC_URL}/vote`

### Frontend Routing

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login` | User login |
| `/register` | User registration |
| `/user` | Protected feed dashboard |
| `/user/posts` | Protected posts listing |
| `/user/communities` | Protected community discovery and creation |
| `/user/communities/[id]/create-post` | Protected community post creation |

### Authentication Flow

`UserAuthProvider` calls:

```text
GET /sdedit/user/session
```

with `credentials: "include"`. If the cookie is valid, the user is stored in context. The protected dashboard layout redirects unauthenticated users to `/login`.

## Backend

Location: `sdedit_backend`

### Frameworks and Libraries

- Express 5
- Prisma 7
- PostgreSQL
- JWT
- bcrypt
- cookie-parser
- cors
- multer
- validator
- DOMPurify with JSDOM

### Important Files

- `index.js`: Starts the server and handles shutdown/error events.
- `src/app.js`: Express app, middleware, static uploads, route mounting, global error handler.
- `src/config/db.js`: Prisma client and PostgreSQL adapter setup.
- `src/middlewars/authMiddleware.js`: JWT cookie/header authentication.
- `src/controllers/*`: Route handlers.
- `src/routes/*`: API routes.
- `src/utils/uploads.js`: Image upload helper.
- `src/utils/cookies.js`: JWT cookie helper.
- `src/utils/sanitize.js`: Input sanitization helpers.
- `src/utils/validator.js`: User input validators.
- `prisma/schema.prisma`: Database schema.

### Backend Environment

Create `sdedit_backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-secure-secret"
JWT_EXPIRE="1"
CLIENT_URL="http://localhost:3000"
BASEURL="http://localhost:5000/"
PORT=5000
NODE_ENV="development"
```

Environment variable notes:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `JWT_SECRET`: Secret used to sign JWTs.
- `JWT_EXPIRE`: Expiration value used by JWT and cookie max age. Current code treats this as hours for cookie max age.
- `CLIENT_URL`: CORS origin. Use the frontend URL in development.
- `BASEURL`: Prefix used to build public upload URLs.
- `PORT`: API server port.
- `NODE_ENV`: Controls Prisma logging and cookie security behavior.

### Backend Setup

```bash
cd sdedit_backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### API Base URL

Local API base:

```text
http://localhost:5000/sdedit
```

Health route:

```text
GET http://localhost:5000/
```

Most `/sdedit/*` routes are protected by `verifyToken` and require the `token` cookie or a Bearer token.

## API Routes

### User Routes

Mounted at `/sdedit/user`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Register user and set auth cookie |
| `POST` | `/login` | No | Login user and set auth cookie |
| `POST` | `/logout` | Yes | Clear auth cookie |
| `PUT` | `/update` | Yes | Update user name or bio |
| `POST` | `/avatar` | Yes | Upload user avatar |
| `GET` | `/session` | Yes | Return current session user |

Example register body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```

### Community Routes

Mounted at `/sdedit/community`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/create` | Yes | Create a community and add creator as member |
| `GET` | `/` | Yes | List communities with member count and joined status |
| `GET` | `/:communityId` | Yes | Get one community |
| `PUT` | `/` | Yes | Update community description |
| `DELETE` | `/:communityId` | Yes | Delete community as creator |
| `POST` | `/avatar` | Yes | Upload community avatar as creator |
| `POST` | `/banner` | Yes | Upload community banner as creator |

Example create body:

```json
{
  "name": "Web Developers",
  "description": "A community for web development discussions."
}
```

### Community Member Routes

Mounted at `/sdedit/community-member`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/create` | Yes | Join a community |

The frontend calls this route from `CommunityCard`.

### Post Routes

Mounted at `/sdedit/post`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/create` | Yes | Create an image post |
| `GET` | `/` | Yes | List posts with author, vote, and comment counts |
| `GET` | `/:postId` | Yes | Get one post |
| `PUT` | `/poster` | Yes | Update post image as author |
| `PUT` | `/details` | Yes | Update title/content as author |
| `DELETE` | `/:postId` | Yes | Delete post as author |

Create post uses `multipart/form-data` with:

- `file`: image file
- `title`: post title
- `content`: post content
- `communityId`: target community id

### Comment and Reply Routes

Mounted at both `/sdedit/comment` and `/sdedit/reply`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/create` | Yes | Create top-level comment |
| `POST` | `/create-reply` | Yes | Create nested reply |
| `GET` | `/comments/:postId` | Yes | Get top-level comments for a post |
| `GET` | `/reply/:postId/:parentCommentId` | Yes | Get replies for a comment |
| `PUT` | `/:commentId` | Yes | Update comment/reply as author |
| `DELETE` | `/:commentId` | Yes | Delete comment/reply as author |

Example comment body:

```json
{
  "postId": "post-id",
  "content": "This is a useful post."
}
```

Example reply body:

```json
{
  "postId": "post-id",
  "parentComment": "comment-id",
  "content": "I agree."
}
```

### Vote Routes

Mounted at `/sdedit/vote`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Yes | Add, update, or remove a vote |

Example post vote body:

```json
{
  "postId": "post-id",
  "value": 1
}
```

Example comment vote body:

```json
{
  "commentId": "comment-id",
  "value": -1
}
```

Allowed vote values:

- `1`: upvote
- `-1`: downvote

Clicking the same vote again removes it.

## Data Model

The Prisma schema defines these main models:

### Users

Stores profile and authentication data.

Important fields:

- `id`
- `name`
- `email`
- `password`
- `avatar`
- `bio`

Relations:

- Communities created by the user
- Community memberships
- Posts
- Comments
- Votes

### Community

Stores discussion spaces.

Important fields:

- `id`
- `name`
- `description`
- `banner`
- `avatar`
- `creatorId`

Relations:

- Creator user
- Members
- Posts

### CommunityMember

Join table between users and communities.

Important rule:

- Unique pair: `userId` and `communityId`

### Post

Stores community posts with images.

Important fields:

- `id`
- `title`
- `content`
- `imageUrl`
- `authorId`
- `communityId`

Relations:

- Author
- Community
- Comments
- Votes

### Comment

Stores comments and nested replies.

Important fields:

- `id`
- `content`
- `authorId`
- `postId`
- `parentId`

Replies are implemented with a self relation using `parentId`.

### Vote

Stores post and comment votes.

Important fields:

- `id`
- `value`
- `userId`
- `postId`
- `commentId`

Important rules:

- A user can vote once per post.
- A user can vote once per comment.

## Uploads

The backend stores uploaded images below the `uploads` directory and serves them with:

```text
/uploads
```

Upload categories used by the app:

- `uploads/user/avatar`
- `uploads/community/avatar`
- `uploads/community/banner`
- `uploads/post/image`

Public image URLs are built with:

```text
BASEURL + uploadedImage.path
```

## Security Notes

- Passwords are hashed with bcrypt.
- JWTs are stored in HTTP-only cookies.
- The auth middleware also accepts `Authorization: Bearer <token>`.
- Input is sanitized before writes in several controllers.
- Production cookies use `secure: true` and `sameSite: "none"`.
- Protected frontend dashboard pages wait for session validation before rendering content.

## Current Development Notes

- There are no automated tests configured yet.
- The backend `npm test` script is still the default placeholder.
- `postRoutes.js` currently declares `DELETE /:postId` twice.
- Some names contain typos, for example `middlewars`, `getPOst`, `createCommnet`, and `voteContoller`. These do not block runtime behavior but can be cleaned up later.
- The frontend has repeated post-fetching logic in `/user` and `/user/posts`; this could be extracted into a shared API helper later.

## Common Local Workflow

Start backend:

```bash
cd sdedit_backend
npm run dev
```

Start frontend in another terminal:

```bash
cd sdedit
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Suggested Next Improvements

- Add backend integration tests for auth, posts, communities, and votes.
- Add frontend loading and empty states for communities and posts.
- Add typed API helper functions in the frontend.
- Add a single source of truth for API base URLs.
- Add route-level validation middleware for request bodies.
- Add Prisma seed data for local development.
