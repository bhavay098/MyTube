/*
 * ASYNC HANDLER - Error handling wrapper for Express.js async functions
 * Purpose: Automatically catch errors from async route handlers and pass them to Express
 * Without this, async errors would crash the app instead of being handled gracefully
*/

// METHOD 1: Promise-based approach (current implementation)
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {   // Returns a new function that Express can call with (req, res, next)
        // Promise.resolve() ensures we always get a Promise (works with both async and sync functions). If requestHandler is async -> keeps it as Promise. If requestHandler is sync -> converts return value to Promise
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))   // Pass any errors to Express error handling middleware
        // Note: We don't use .then() because the original function handles its own success
    }
}


export { asyncHandler }




// const asyncHandler = () => { }
// const asyncHandler = (func) => { () => {} }
// const asyncHandler = (func ) => async () => {}


// METHOD 2: Async/await approach (alternative implementation)
/*
const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next)   // Wait for the async function to complete. If successful, the original function handles the response (res.json(), etc.)

    } catch (error) {   // If error occurs, send error response directly (instead of using Express middleware)
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/