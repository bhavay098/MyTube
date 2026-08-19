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

## Demo flow

Use the following flow to explore the main application features:

1. Open the [live App](https://mytube.bhavaynagpal.com/) and register a new account, or log in with an existing account.
2. Browse the home page and Explore section to search for and discover published videos.
3. Open a video to watch it, like it, add a comment, and verify that views and watch history are updated.
4. Visit a channel profile to view its videos and subscribe to the creator.
5. Open the Dashboard to upload a video, add its thumbnail and metadata, then publish it.
6. Create a playlist and save videos for later access from the Playlists page.
7. Visit Tweets to create a post, browse other posts, and interact with them.
8. Use Liked Videos, Subscriptions, and Watch History to revisit personalized content.
9. Open Settings to update profile details, change the theme, or manage account preferences.
