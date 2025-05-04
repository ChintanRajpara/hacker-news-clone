# 📰 Hacker News Clone – Fullstack Take-home Assignment

🔗 **Live Demo**: [https://www.hackernewsclone.online/](https://www.hackernewsclone.online/)

---

## 🚀 Features

- 🔐 **Authentication**: Signup, Login, Logout with secure password hashing.
- 📃 **Post Feed**:

  - Cursor-based pagination or infinite scroll.
  - Displays title, link/text, author, points, and comment count.

- 📝 **Post Submission**:

  - URL or text-based posts for authenticated users.

- 💬 **Threaded Comments**:

  - Add, edit, and delete nested replies.

- 🔼🔽 **Voting**: Upvote/Downvote posts.
- 🔍 **Sorting & Search**:

  - Sort by new, top, or best.
  - Keyword-based search with fuzzy match.

- ⚡ **Optimistic UI**:

  - Shared updater handles create, edit, and delete actions.

- 📱 **Responsive Design**:

  - Mobile-friendly UI using Tailwind CSS + DaisyUI.
  - Dialogs for all interactions like login/signup/create-post.

- 🧭 **Navigation**:

  - Powered by React Router.
  - Guarded actions using useAuthenticatedClick hook.

- 🐳 **Dockerized**:

  - Development and production setups with Docker Compose.

- 🧃 **Rate Limiting**:

  - IP-based request throttling to prevent spam.

---

## 🧠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, DaisyUI, React Router
- **State Management**: TanStack Query (React Query)
- **Backend**: Node.js (Express)
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Structure

plaintext
/
├── api-server/
│ ├── src/
│ ├── Dockerfile.development
│ ├── Dockerfile.production
│ ├── .env.development
│ └── .env.production
├── client/
│ ├── src/
│ ├── Dockerfile.development
│ ├── Dockerfile.production
│ ├── .env.development
│ └── .env.production
├── docker-compose.development.yml
├── docker-compose.production.yml
└── README.md

---

## ⚙️ Setup Instructions

### 🚧 Development

1. Clone the repository:

bash
git clone https://github.com/ChintanRajpara/hacker-news-clone.git
cd hacker-news-clone

2. Start in development mode:

bash
docker compose -f docker-compose.development.yml up --build

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8080](http://localhost:8080)
- MongoDB: localhost:27017

---

### 🚀 Production

1. Build and run production containers:

bash
docker compose -f docker-compose.production.yml up --build -d

2. Environment files:

   - Use .env.production in both /api-server and /client
   - Dockerfiles automatically copy and rename them as .env

---

## 🌐 Environment Variables

### 📦 API Server

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| PORT           | API server port (default: 8080)          |
| DB_HOST        | MongoDB host (e.g. mongo)                |
| DB_PORT        | MongoDB port (e.g. 27017)                |
| DB_NAME        | MongoDB database name                    |
| JWT_SECRET     | Secret key for JWT authentication        |
| ALLOWED_ORIGIN | CORS origin (e.g. http://localhost:5173) |

### 🎯 Client

| Variable                 | Description                               |
| ------------------------ | ----------------------------------------- |
| VITE_API_SERVER_ENDPOINT | API base URL (e.g. http://localhost:8080) |

---

## 🤖 AI Tools Used

To accelerate development while focusing on core logic and UX, I used AI tools as efficient coding assistants.

They were primarily used to:

- Automate redundant patterns (e.g., form logic, CRUD handlers, API scaffolds).
- Speed up utility function generation after clearly outlining logic.
- Maintain consistency and eliminate repetitive boilerplate without compromising clarity.

All architectural and design decisions were made beforehand; AI was used to **implement** my ideas more efficiently — enhancing velocity, not replacing thought.

## 🧱 Future Enhancements

While the core functionality has been implemented, there are several improvements and features planned for future iterations of this project. Due to time constraints, the following enhancements were not added:

- **User Profile Pages** – Display user activity, stats, and submissions.
- **Post Save Drafts** – Allow users to save drafts before publishing.
- **Notifications System** – Real-time alerts for comments, replies, and upvotes.
- **Comment Voting** – Enable voting on comments to surface relevant discussions.
- **Accessibility Improvements** – Better keyboard navigation and ARIA support.
- **XSS & Input Validation** – Harden input handling with stricter validation and sanitization.
- **Comprehensive Testing** – Expand test coverage across frontend and backend.

These additions are part of the project roadmap and will be tackled in future updates.

## 📘 API Documentation

### 🔐 Authentication

#### POST /auth/signup

Registers a new user.

**Request Body:**

json
{
"name": "john_doe",
"email": "john@example.com",
"password": "securePassword"
}

**Response:**

json
{
"message": "User created successfully."
}

- A secure Set-Cookie header is sent with the JWT token for session authentication.

#### POST /auth/signin

Logs in an existing user.

**Request Body:**

json
{
"email": "john@example.com",
"password": "securePassword"
}

**Response:**

json
{
"message": "Logged in successfully."
}

- A secure Set-Cookie header is sent with the JWT token for session authentication.

#### POST /auth/logout

Logs out the user.

**Response:**

json
{
"message": "Logged out successfully."
}

Also clears the session cookie on the client via Set-Cookie with an expired token.

#### GET /posts

Fetches a paginated list of posts with optional search and sorting.

#### 🔍 Query Parameters

| Parameter | Type   | Description                                                          |
| --------- | ------ | -------------------------------------------------------------------- |
| limit     | number | Number of posts per page (optional, default: 10)                     |
| cursor    | string | ID of the last item from previous page (for cursor-based pagination) |
| sort      | string | Sorting method: "new" (default), "top", or "best"                    |
| search    | string | Keyword to search in title or text (optional)                        |

#### ✅ Response

json
{
"posts": [
{
"id": "abc123",
"title": "Interesting Post",
"url": "https://example.com",
"text": null,
"author": {
"id": "user456",
"name": "jane_doe"
},
"votes": 42,
"selfVoteValue": 1,
"comments_count": 8,
"createdAt": "2025-05-04T12:34:56.789Z"
}
// ...more posts
],
"pageInfo": {
"nextCursor": "abc123" // null if no more posts
}
}

#### GET /posts/:id

Fetch detailed information about a single post by its ID.

#### 🔗 URL Parameter

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| id        | string | Unique identifier of post |

#### ✅ Response

json
{
"post": {
"id": "abc123",
"title": "Interesting Post",
"url": "https://example.com",
"text": null,
"author": {
"id": "user456",
"name": "jane_doe"
},
"votes": 42,
"selfVoteValue": 1,
"comments_count": 8,
"createdAt": "2025-05-04T12:34:56.789Z"
}
}

#### 🆕 POST /posts/

Create a new post (URL or text-based). Requires authentication via cookie.

#### 🧾 Request Body

| Field | Type   | Required | Description                        |
| ----- | ------ | -------- | ---------------------------------- |
| title | string | ✅       | Title of the post                  |
| url   | string | ❌       | Optional link (use for link posts) |
| text  | string | ❌       | Optional text (for text posts)     |

#### ✅ Response

json
{
"post": {
"id": "abc123",
"title": "Interesting Post",
"url": "https://example.com",
"text": null,
"author": {
"id": "user456",
"name": "jane_doe"
},
"votes": 42,
"selfVoteValue": 1,
"comments_count": 8,
"createdAt": "2025-05-04T12:34:56.789Z"
},
"message": "Post created successfully!"
}

#### ✏️ PUT /posts/:id

Edit an existing post. Requires authentication and ownership of the post.

#### 🔗 URL Parameter

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| id        | string | ID of the post |

#### 🧾 Request Body

| Field | Type   | Required | Description                        |
| ----- | ------ | -------- | ---------------------------------- |
| title | string | ❌       | Optional title of the post         |
| url   | string | ❌       | Optional link (use for link posts) |
| text  | string | ❌       | Optional text (for text posts)     |

#### ✅ Response

json
{
"post": {
"id": "abc123",
"title": "Interesting Post",
"url": "https://example.com",
"text": null,
"author": {
"id": "user456",
"name": "jane_doe"
},
"votes": 42,
"selfVoteValue": 1,
"comments_count": 8,
"createdAt": "2025-05-04T12:34:56.789Z"
},
"message": "Post updated successfully!"
}

#### ❌ DELETE /posts/:id

Delete a post by its ID. Requires authentication and ownership of the post.

#### 🔗 URL Parameter

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| id        | string | ID of the post |

#### ✅ Response

json
{
"message": "Post deleted successfully"
}

Server validates ownership before deletion. Responds with a success message.

#### 👍 PUT /posts/:id/vote

Vote on a post (upvote, downvote, or unvote). Requires authentication and ensures that the user can only vote once.

#### 🔗 URL Parameter

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| id        | string | ID of the post |

#### 🧾 Request Body

| Field     | Type   | Required | Description                                             |
| --------- | ------ | -------- | ------------------------------------------------------- |
| voteValue | string | ✅       | Vote value: 1 for upvote, -1 for downvote, 0 for unvote |

#### ✅ Response

json
{
"post": {
"id": "abc123",
"title": "Interesting Post",
"url": "https://example.com",
"text": null,
"author": {
"id": "user456",
"name": "jane_doe"
},
"votes": 42,
"selfVoteValue": 1,
"comments_count": 8,
"createdAt": "2025-05-04T12:34:56.789Z"
},
"message": "Vote is already the same"
}

#### 💬 POST /comments

Create a new comment on a post.

#### 🧾 Request Body

| Field    | Type   | Required | Description                                    |
| -------- | ------ | -------- | ---------------------------------------------- |
| postId   | string | ✅       | The ID of the post                             |
| text     | string | ✅       | The content of the comment                     |
| parentId | string | ❌       | ID of the parent comment (for nested comments) |

#### ✅ Response

json
{
"comment": {
"author": {
"id": "string",
"name": "string"
},
"createdAt": "2023-01-01T00:00:00Z",
"parentId": "string",
"replies": [],
"postId": "string",
"text": "This is a new comment",
"updatedAt": "2023-01-01T00:00:00Z",
"id": "string"
}
}

#### ✏️ PUT /comments/:commentId

Create a new comment on a post.

#### 🔗 URL Parameter

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | ID of the comment |

#### 🧾 Request Body

| Field | Type   | Required | Description           |
| ----- | ------ | -------- | --------------------- |
| text  | string | ✅       | The ID of the comment |

#### ✅ Response

json
{
"message": "Comment updated successfully"
}

#### ❌ DELETE /comments/:commentId

Delete a specific comment by its ID.

#### 🔗 URL Parameter

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| commentId | string | ID of the comment to delete |

#### ✅ Response

json
{
"message": "Comment deleted successfully"
}

### 📄 GET /comments/:postId

Fetch the list of comments for a specific post, with pagination support.

#### 🔗 URL Parameter

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| postId    | string | The ID of the post to fetch comments for |

#### 🧾 Query Parameters

| Parameter | Type   | Default | Description                                         |
| --------- | ------ | ------- | --------------------------------------------------- |
| limit     | number | 10      | The number of comments to fetch                     |
| cursor    | string | ❌      | Cursor for pagination to fetch next set of comments |

#### ✅ Response

json
{
"comments": [
{
"author": {
"id": "string",
"name": "string"
},
"createdAt": "2023-01-01T00:00:00Z",
"parentId": "string",
"replies": [],
"postId": "string",
"text": "This is a comment",
"updatedAt": "2023-01-01T00:00:00Z",
"id": "string"
}
],
"pageInfo": {
"nextCursor": "next_cursor_value"
}
}
