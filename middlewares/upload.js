const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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
//             // cb(null, `${file.fieldname}-${timestamp}-${random}${ext}`);
//             cb(null, `${file.fieldname}-${timestamp}${ext}`);
//         }
//     });
// };

// configure cloudinary
cloudinary.config({
    cloud_name: process.env.COUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// File Filter
const fileFilter = (allowedTypes) => (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new ErrorHandler(`Only ${ allowedTypes.join(', ') } are allowed`, 400), false);
    }

    if (file.size > FILE_SIZE_LIMIT) {
        return cb(new ErrorHandler(`File size should be less than ${ FILE_SIZE_LIMIT / (1024 * 1024) }MB`, 400), false);
    }

    cb(null, true);
};

const userStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecom/users',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
})

const productStorage = multer({
    cloudinary: cloudinary,
    params: {
        folder: 'ecom/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
})

// User Upload Configuration
const userUpload = multer({
    storage: userStorage,
    limits: { fileSize: FILE_SIZE_LIMIT },
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES)
}).single('profileImage');

// Product Upload Configuration
const productUpload = multer({
    storage: productStorage,
    limits: { fileSize: FILE_SIZE_LIMIT },
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES)
}).array('productImages', 10);

module.exports = {
    upload: userUpload,
    multipleProductUpload: productUpload,
    cloudinary
};