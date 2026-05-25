import mongoose from "mongoose";   // Import mongoose for working with MongoDB
import { DB_NAME } from "../constants.js";   // Import a constant (DB_NAME) from another file. This is the name of the database we want to connect to

// Create an async function to connect to MongoDB
const connectDB = async () => {
    try {
        // Try to connect to MongoDB using Mongoose | process.env.MONGODB_URI -> our cluster URI from .env | DB_NAME -> your chosen database name
        // connectionInstance is an object returned by mongoose.connect(). It’s a reference to the active connection + config. It has lots of useful properties and methods
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)   // If successful, log the host where MongoDB is running

    } catch (error) {
        console.error('MONGODB connection FAILED:', error)   // If connection fails, log the error
        process.exit(1)   // Exit the process with a non-zero status code. (1 = error), so it doesn’t keep running in a broken state
    }
}

export default connectDB