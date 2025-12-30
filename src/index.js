// require('dotenv').config({path: './.env'})
// import mongoose from "mongoose";   // Import mongoose to connect with MongoDB
// import { DB_NAME } from "./constants";   // Import a constant (DB_NAME) from another file (likely the database name)
import dotenv from 'dotenv'   // Import dotenv package to load environment variables from .env file
import connectDB from "./db/index.js";   // Import the database connection function we created in db/index.js
import { app } from './app.js';

dotenv.config({ path: './.env' })   // Load environment variables from the .env file into process.env | { path: './.env' } means explicitly look for the .env file in the root folder

connectDB()   // Call the function to connect to MongoDB
    .then(() => {
        app.listen(process.env.PORT || 8000, () => console.log(`Server is running at port: ${process.env.PORT}`))
    })
    .catch((error) => console.log('MONGODB connection failed !!', error))












/* +++++++++++++ First Approach +++++++++++++++++++

import express from "express";   // Import express framework for creating the server
const app = express()   // Create an Express application instance

    // Immediately Invoked Async Function Expression (IIFE). Used here so we can use async/await at the top level
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   // Connect to MongoDB using Mongoose. The URI comes from environment variables, DB_NAME is appended at the end
            
            // handeling error when DB is connected but express is facing issue while connecting with DB
            app.on("error", (error) => {   // Handle server-level errors (like port already in use, etc.) | app.on(eventName, callback)
                console.error("ERROR:", error)
                throw error
            })

            app.listen(process.env.PORT, () => {   // Start the server on the port defined in .env
                console.log(`App is listening on PORT: ${process.env.PORT}`)   
            })

        } catch (error) {
            console.error('ERROR:', error)   // If there is an error in DB connection or server startup, log it
            throw error
        }
    })()
*/