# MyTube

MyTube is a completed full-stack video-sharing platform inspired by YouTube. It provides a responsive React client and an Express API backed by MongoDB, with authentication, media uploads, creator tools, social interactions, and personalized video features.

**[Live Demo](https://mytube.bhavaynagpal.com/)** - Try the fully working app.

## Features

### Authentication and profiles

- User registration, login, logout, and token refresh
- JWT-based authentication with cookie support
- Protected routes for authenticated features
- Profile avatar and cover-image updates

### Video platform

- Browse and search published videos
- View video details and track views
- Upload, update, publish, and delete videos
- Watch history and liked videos
- Cloudinary-backed media storage

### Social features

- Like and unlike videos, comments, and tweets
- Comment on videos
- Create and browse tweet-style posts
- Subscribe to channels and manage subscriptions

### Creator tools

- Creator dashboard with channel and video data
- Create and manage playlists
- Save videos to playlists
- Responsive navigation and light/dark theme support

## Tech stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS v4
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- bcrypt
- Cloudinary
- Multer
- Cookie Parser
- CORS

## Project structure

```text
MyTube/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Local development

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd MyTube

cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Configure environment variables

Create `Backend/.env`:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<refresh-token-secret>
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

For local frontend development, create `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Keep environment files and credentials private. The MongoDB database used by the backend is named `youtubeProject`.

## Available scripts

### Backend

| Command         | Description                                              |
| --------------- | -------------------------------------------------------- |
| `npm run dev`   | Start the API with Node watch mode                       |
| `npm start`     | Start the API normally                                   |
| `npm run build` | Run the backend build command; no build step is required |

### Frontend

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Create a production frontend build   |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Preview the production build locally |

## Authentication and uploads

The frontend sends requests with credentials enabled so the backend can manage authentication cookies. When an access token expires, the Axios client attempts a refresh-token request before redirecting an unauthenticated user to login. Video and profile media are uploaded through Multer and stored with Cloudinary.

## Project status

MyTube is feature-complete and deployed. The README documents the final application structure, local development workflow, and production-facing services.
