import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from "./db/index.js";
import { app } from './app.js';

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server is running at port: ${PORT}`);
        });

        // Handle process termination signals for graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                console.log('HTTP server closed.');
                try {
                    await mongoose.connection.close(false);
                    console.log('MongoDB connection closed.');
                    process.exit(0);
                } catch (err) {
                    console.error('Error during MongoDB disconnect:', err);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((error) => {
        console.error('MONGODB connection failed !!', error);
        process.exit(1);
    });