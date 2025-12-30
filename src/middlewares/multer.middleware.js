import multer from "multer";   // Import Multer (middleware for handling file uploads in Express)

// Configure Multer to use disk storage (saves files to a folder on your server)
const storage = multer.diskStorage({
    // Where to store uploaded files
    destination: function (req, file, cb) {
        // "cb" = callback -> first argument is error (null = no error), second is the folder path
        cb(null, './public/temp')   // Files will be temporarily stored here
    },
    // How to name the uploaded files
    filename: function (req, file, cb) {
        cb(null, file.originalname)   // Currently using the original file name from the client
        /*
         ⚠️ NOTE: Using original names can cause overwriting if two users upload same filename.
         Better approach later: use Date.now() or unique IDs to make filename unique
         Example: cb(null, Date.now() + '-' + file.originalname)
        */
    }
})

// Create Multer instance with the above storage settings. This "upload" middleware can now be used in your routes
export const upload = multer({ storage })