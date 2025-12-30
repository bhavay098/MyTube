// Custom class to standardize successful API responses
class ApiResponse {
    constructor(
        statusCode,   // HTTP status code (e.g., 200 OK, 201 Created)
        data,   // Actual response data to send back to the client
        message = 'Success'   // Default message (can be overridden if needed)
    ) {
        this.statusCode = statusCode   // Store the HTTP status code
        this.data = data   // Store any data we want to send back (user info, list of items, etc.)
        this.message = message   // Response message (default is "Success", but can be custom like "User created")

        // Automatically set success flag: true if statusCode < 400 (200–399 = success range). false if statusCode >= 400 (error range)
        this.success = statusCode < 400
    }
}

export { ApiResponse }   // Export the class for reuse across the app