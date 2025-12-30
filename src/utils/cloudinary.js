import { v2 as cloudinary } from 'cloudinary';   // Import Cloudinary SDK (v2 API) and file system module
import fs from 'fs'

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} localFilePath - The path of the file stored locally (e.g., uploaded by Multer).
 * @returns {object|null} - Returns Cloudinary response object if successful, or null if failed.
 */

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null   // If no file path is provided, exit early
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })   // "resource_type: 'auto'" allows images, videos, pdfs, etc.
        // file has been uploaded successfully
        // console.log('file is uploaded on cloudinary', response)
        fs.unlinkSync(localFilePath);   // Remove the locally saved file after successful upload (Prevents your server storage from filling up with temp files)
        return response;   // Return the full response from Cloudinary (contains URL, public_id, etc.)

    } catch (error) {
        fs.unlinkSync(localFilePath)   // If upload failed, still remove the local temp file to keep server clean
        return null;   // Return null so the calling function knows upload failed
    }
}


/**
 * delete a file from Cloudinary
 * @param {string} publicId - The public_id of the file in Cloudinary
 * @returns {object|null} - Returns Cloudinary response object if successful, or null if failed.
 */

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null   // If no publicId is provided, exit early
        // delete the file from cloudinary
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })   // "resource_type: 'auto'" allows images, videos, pdfs, etc.
        return response;   // Response will contain { result: 'ok' } if deleted

    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return null;   // Return null so the calling function knows deletion failed
    }
}

// Export the functions so they can be used in other files
export { uploadOnCloudinary, deleteFromCloudinary }