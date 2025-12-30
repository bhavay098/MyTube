// Custom error class that extends JavaScript's built-in Error class. This is used to create standardized error objects for API responses

class ApiError extends Error {
    constructor(
        statusCode,   // HTTP status code (like 400, 404, 500)
        message = 'Something went wrong',   // Default error message if none is provided
        errors = [],   // Array to store multiple error details
        stack = ''   // Optional custom stack trace (for debugging)
    ) {
        super(message)   // Call the parent Error class constructor with the message. This sets the "message" property on the error object

        // Custom properties specific to our API error
        this.statusCode = statusCode   // Store the HTTP status code (like 400 for bad request, 500 for server error)
        this.data = null   // Set data property to null as there is no useful data to send — because the operation failed. This could be used to store additional error data. So, by convention, data is set to null in an error object to keep the response structure consistent with successful responses. 
        this.message = message   // Explicitly set the error message (overrides parent just in case). This ensures the message property is always available on the error object
        this.success = false   // Flag to indicate failure (useful in API responses)
        this.errors = errors   // Store detailed errors (e.g., validation issues)

        // Handle stack trace (helps with debugging)
        if (stack) {
            this.stack = stack   // If a stack trace is manually provided, use it
        } else {
            Error.captureStackTrace(this, this.constructor)   // Otherwise, capture the current stack trace and associate it with this specific error class. This removes the constructor itself from the stack trace for cleaner debugging
        }
    }
}

export {ApiError}   // Export the custom ApiError class so it can be reused in other files