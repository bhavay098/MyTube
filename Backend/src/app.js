import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApiError } from './utils/ApiError.js'
import { errorHandler } from './middlewares/error.middleware.js'

const app = express()

// Enable CORS (Cross-Origin Resource Sharing)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(new ApiError(403, 'CORS request blocked by security policy'))
    },
    credentials: true,
  })
)

// Parse incoming JSON requests (limit 16kb)
app.use(express.json({ limit: '16kb' }))

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true, limit: '16kb' }))

// Serve static files from the "public" folder
app.use(express.static('public'))

// Parse cookies from incoming requests
app.use(cookieParser())

// ------------ routes import ---------------------
import userRouter from './routes/user.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'

// ----------- routes declaration -----------------
app.use('/api/v1/users', userRouter)
app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/playlist', playlistRouter)
app.use('/api/v1/dashboard', dashboardRouter)

// 404 Route Not Found Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`))
})

// Centralized Global Error Handler
app.use(errorHandler)

export { app }
