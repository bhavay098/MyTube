# 🎥 MyTube

MyTube is a full-stack YouTube-style video platform with a Node.js/Express backend, MongoDB database, and a React frontend. It supports authentication, video browsing, uploads, likes, comments, playlists, subscriptions, tweets, watch history, and creator dashboard features.

## 🌐 Live Demo

- https://mytube-pi-tan.vercel.app/

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based access and refresh token flow
- Cookie-based session handling

### 🎬 Video Platform
- Browse published videos
- View individual video details
- Upload, update, publish, and delete videos
- Track views and watch history

### 💬 Engagement
- Like and unlike videos, comments, and tweets
- Comment on videos
- Create short tweet-style posts
- Follow and manage subscriptions

### 📱 User Experience
- Responsive UI with mobile navigation
- Search videos from the homepage
- Theme toggle support
- Protected routes for authenticated features

### 🛠 Creator Tools
- Update profile avatar and cover image
- Manage playlists and saved content
- Access creator dashboard data
- Upload media assets through Cloudinary

## 🧰 Tech Stack

### Frontend
- React 19
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS v4
- Vite

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcrypt
- Cloudinary
- Multer
- Cookie Parser
- CORS

## 📁 Project Structure

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

## ⚙️ Available Scripts

### Backend
- `npm run dev` - start the API with watch mode
- `npm start` - start the API normally
- `npm run build` - placeholder build script

### Frontend
- `npm run dev` - start the Vite dev server
- `npm run build` - build the frontend for production
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## 🔌 API Overview

The backend exposes routes under `/api/v1`, including:

- `/users`
- `/videos`
- `/comments`
- `/likes`
- `/tweets`
- `/subscriptions`
- `/playlist`
- `/dashboard`
- `/healthcheck`

## 📝 Notes

- The frontend uses cookie-based auth, so `withCredentials` is enabled in Axios.
- Uploads are sent to Cloudinary and cleaned up after use.
- Mobile navigation is responsive and includes a search bar plus slide-out menu.
