# ChatsApp

ChatsApp is a real-time web chat application with direct messaging, group conversations, friend requests, online presence, emoji support, avatar uploads, and persistent sessions.

## Live Services

- Frontend: [https://chat-app-vinh-duys-projects.vercel.app](https://chat-app-vinh-duys-projects.vercel.app/)
- Backend API: [https://apt-backend-3208.onrender.com](https://apt-backend-3208.onrender.com)
- API health check: [https://apt-backend-3208.onrender.com/api/health](https://apt-backend-3208.onrender.com/api/health)
- API documentation: [https://apt-backend-3208.onrender.com/api-docs](https://apt-backend-3208.onrender.com/api-docs)
- Repository: [https://github.com/vinhduy-https/APT](https://github.com/vinhduy-https/APT)

Set `CLIENT_URL=https://chat-app-vinh-duys-projects.vercel.app` in the Render backend environment.

## Features

- Account registration and sign-in with access and refresh tokens
- HTTP-only refresh-token cookie sessions
- Direct and group conversations
- Real-time messages and online-user presence with Socket.IO
- Friend search and friend-request management
- Real-time friend requests and friend-list updates
- Emoji picker, text messages, and image messages
- Cloudinary avatar uploads
- Editable profile details including display name, username, email, phone, and bio
- Responsive interface with light and dark themes
- Swagger/OpenAPI documentation for the backend

## Project Structure

```text
.
├── backend/    Express, Socket.IO, MongoDB, JWT, and Cloudinary service
└── frontend/   React, TypeScript, Vite, Zustand, Tailwind CSS, and Radix UI
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB database
- Cloudinary account for avatar uploads

## Local Development

### 1. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure the values in `backend/.env` before starting the server:

```env
PORT=5001
MONGODB_CONNECTIONSTRING=mongodb+srv://<username>:<password>@<cluster>/<database>
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

The backend runs at `http://localhost:5001`.

### 2. Start the frontend

```bash
cd frontend
cp .env.development .env.local
npm install --legacy-peer-deps
npm run dev
```

The frontend runs at `http://localhost:5173`.

For a local backend, use these frontend variables:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

The `--legacy-peer-deps` flag is currently required because `@emoji-mart/react` has a peer dependency range that stops at React 18 while this project uses React 19.

## Production Deployment

### Backend on Render

Create a Render Web Service using the `backend` directory.

- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Set these Render environment variables:

- `MONGODB_CONNECTIONSTRING`
- `CLIENT_URL` set to the Vercel frontend URL
- `ACCESS_TOKEN_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Render free services can sleep when idle. The first request after inactivity may therefore be slow while the service wakes up and reconnects to MongoDB.

### Frontend on Vercel

Import the repository into Vercel and set the project root to `frontend`.

Set these Vercel environment variables:

```env
VITE_API_URL=https://apt-backend-3208.onrender.com/api
VITE_SOCKET_URL=https://apt-backend-3208.onrender.com
```

Deploy after setting the variables. Vite embeds these values at build time, so redeploy after changing them.

## Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

### Backend

```bash
npm run dev       # Start with Nodemon
npm start         # Start the production server
```

## API Documentation

When the backend is running, Swagger UI is available at `/api-docs`. The deployed documentation is available at [apt-backend-3208.onrender.com/api-docs](https://apt-backend-3208.onrender.com/api-docs).

## Security Notes

- Never commit `.env` files or real API keys.
- Rotate any credentials that have previously been committed or shared.
- Use a long, random `ACCESS_TOKEN_SECRET` in production.
- Configure MongoDB network access and database permissions for the deployed backend.

## Known Operational Considerations

- Render cold starts can add latency to the first authentication request after inactivity.
- The initial authenticated page loads the current user and conversations, then opens the Socket.IO connection.
- The frontend production bundle currently triggers Vite's large-chunk warning; code splitting can improve initial load time in a future performance pass.
