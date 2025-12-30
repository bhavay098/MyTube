import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.CORS_ORIGIN,   // origin: only allow requests from specific frontend (from env variable)
    credentials: true   // credentials: allow cookies, authorization headers, etc. to be sent
}))

// Parse incoming JSON requests - limit: maximum request body size (16kb). prevents very large JSON payloads from crashing the server
app.use(express.json({ limit: '16kb' }))

// Parse URL-encoded data (e.g., form submissions) - extended: true -> allows nested objects in URL-encoded data
// - limit: also capped at 16kb
app.use(express.urlencoded({ extended: true, limit: '16kb' }))

// Serve static files from the "public" folder. Example: files like images, css, js can be accessed via http://localhost:PORT/filename
app.use(express.static('public'))

// Parse cookies from the incoming requests - makes cookies available in req.cookies - useful for auth tokens stored in cookies
app.use(cookieParser())


// ------------ routes import ---------------------
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


// ----------- routes declaration -----------------
app.use('/api/v1/users', userRouter)   // http://localhost:8000/api/v1/users/register
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)


export { app }   // Export the configured Express app