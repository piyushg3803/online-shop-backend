const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorHandler = require('../utils/errorHandler');

// Configuration constants
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Configure Storage
// const configureStorage = (destinationPath) => {
//     return multer.diskStorage({
//         destination: destinationPath,
//         filename: (req, file, cb) => {
//             const timestamp = Date.now();
//             // const random = Math.round(Math.random() * 1E9);
//             const ext = path.extname(file.originalname);
//             // cb(null, ${file.fieldname}-${timestamp}-${random}${ext});
//             cb(null, ${file.fieldname}-${timestamp}${ext});
//         }
//     });
// };

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// File Filter
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Only JPG/JPEG/PNG/WEBP are allowed`), false);
    }
    cb(null, true);
};

const userStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ecom/users',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
})

const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ecom/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
})

// User Upload Configuration
const upload = multer({
    storage: userStorage,
    limits: { fileSize: FILE_SIZE_LIMIT },
    fileFilter,
}).single('profileImage');

// Product Upload Configuration
const multipleProductUpload = multer({
    storage: productStorage,
    limits: { fileSize: FILE_SIZE_LIMIT },
    fileFilter,
}).array('productImages', 10);

module.exports = {
    upload,
    multipleProductUpload,
    cloudinary
};
