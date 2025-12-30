import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Healthcheck controller
// Purpose: Provide a lightweight endpoint to confirm that the service is running and able to respond to requests. Used by monitoring systems, load balancers and developers for quick liveness checks.

const healthcheck = asyncHandler(async (req, res) => {
    // TODO: build a healthcheck response that simply returns the OK status as json with a message

    // Healthcheck endpoints should always be fast, side-effect free and independent of databases or external services.
    return res
        .status(200)   // Respond with HTTP 200 to indicate the service is alive and reachable.
        .json(new ApiResponse(   // Send a JSON response using the ApiResponse class
            200,   // First parameter: HTTP status code (200 = success)
            {
                // process.uptime() returns how long the Node.js process has been running (in seconds).
                // toFixed(2) rounds it to 2 decimal places,
                // Number(...) converts it back from string to number.
                uptime: Number(process.uptime().toFixed(2)),

                // Current server time in ISO 8601 format (UTC).
                // UTC is used to keep timestamps consistent across environments.
                timestamp: new Date().toISOString()   // new Date() creates a date object, toISOString() formats it
            },
            'Service alive'   // Human-readable message confirming service availability.
        ))
})


export {
    healthcheck
}
