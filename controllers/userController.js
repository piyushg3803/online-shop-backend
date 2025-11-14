const User = require('../models/userModel');
const Product = require('../models/productModel');
const Watchlist = require('../models/watchlistModel');
const Cart = require('../models/cartModel.js');
const Order = require('../models/orderModel.js');
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = require('fs');
const {
    registerValidation,
    loginValidation,
    profileUpdateValidation,
    forgotPasswordValidation,
    resetPasswordTokenValidation,
    updatePasswordValidation
} = require('../validators/authValidator');
const { JsonWebTokenError } = require('jsonwebtoken');
const { profile } = require('console');
const cloudinary = require("cloudinary").v2

//////////////////////////////////////////// USER SIDE ////////////////////////////////////////////

// ---------- Register ---------- //
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate user input
        const { error } = registerValidation(req.body);
        if (error) {
            return next(new ErrorHandler(error.details[0].message, 400));
        }

        // Check existing user
        const userExists = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (userExists) {
            return next(new ErrorHandler(
                userExists.email === email ? "Email already registered" : "Phone number already registered",
                400
            ));
        }

        // Determine user role
        const isFirstUser = await User.countDocuments() === 0;
        const role = isFirstUser ? "admin" : (req.body.role || "user");

        // Create new user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: user
        });

    } catch (err) {
        next(new ErrorHandler(`Registration failed: ${ err.message }`, 500));
    }
};

// ----------  Login ---------- //
exports.login = async (req, res, next) => {
    try {
        const { login, password } = req.body;

        // Validate input
        const { error } = loginValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Find user by email or phone
        const user = await User.findOne({ $or: [{ email: login }, { phone: login }] }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return next(new ErrorHandler("Invalid credentials", 401));
        }

        // Update login status & generate token
        user.loggedIn = true;
        await user.save();
        const token = user.generateToken(user.id);

        // Set secure and sameSite options for cookies
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV, // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
        });

        // Remove password from response
        const { password: _, ...userData } = user.toObject();

        res.status(200).json({ success: true, message: "Login successful", data: userData, token });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

// ----------  Logout ---------- //
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { loggedIn: false }, { new: true });
        if (!user) return next(new ErrorHandler("User not found", 404));

        res.clearCookie("jwt");
        res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

// ----------  Profile ---------- //
exports.getProfile = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return next(new ErrorHandler("User ID is required", 400));
        }

        const [user, watchlist, cart] = await Promise.all([
            User.findById(req.user.id).lean(),
            Watchlist.findOne({ user: req.user.id }).lean(),
            Cart.findOne({ user: req.user.id }).lean()
        ]);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Add watchlist and cart quantities directly to user object
        user.watchlistQuantity = watchlist?.products?.length || 0;
        user.cartQuantity = cart?.totalQuantity || 0;

        const profile = {
            success: true,
            user
        };

        res.status(200).json(profile);

        const isExpired = jw

    } catch (err) {
        next(new ErrorHandler(
            err.name === 'CastError'
                ? "Invalid user ID format"
                : `Server Error: ${ err.message }`,
            err.name === 'CastError' ? 400 : 500
        ));
    }
};

// ----------  Profile Update ---------- //
exports.updateProfile = async (req, res, next) => {
    try {
        const { error } = profileUpdateValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });

        if (!user) return next(new ErrorHandler("User not found", 404));

        res.status(200).json({ success: true, message: "Profile updated successfully", data: user });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

// ----------  Profile Image Update ---------- //
exports.updateProfileImage = async (req, res, next) => {
    try {

        const userImage = req.files;
        if (!userImage) {
            return next(new ErrorHandler("Please upload an image", 400));
        }

        // Add file size validation (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            await fsPromises.unlink(req.file.path);
            return next(new ErrorHandler("Image size should be less than 5MB", 400));
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            await fsPromises.unlink(req.file.path);
            return next(new ErrorHandler("Please upload only JPG, JPEG or PNG images", 400));
        }

        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const profileImage = [];

        for (const file of userImage) {
            if (file.secure_url || (file.path && file.path === 'string' && file.path.startsWith('http'))) {
                profileImage.push({
                    url: file.secure_url || file.path,
                    public_id: file.public_id || file.pathname || null
                })
                continue;
            }

            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'userImage',
                transformation: [{ width: 800, height: 800, crop: 'limit' }]
            });

            profileImage.push({ url: result.secure_url, public_id: result.public_id });
        }

        user.profileImage = profileImage.length === 1 ? profileImage[0] : profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: {
                profileImage: user.profileImage
            }
        });

    } catch (err) {
        // Cleanup uploaded file if error occurs
        if (req.file) {
            await fsPromises.unlink(req.file.path).catch(console.error);
        }
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};
    
// ----------  Password Update ---------- //
exports.updatePassword = async (req, res, next) => {
    try {
        const { error } = updatePasswordValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isPasswordMatched = await user.comparePassword(req.body.password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Old password is incorrect", 400));
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new ErrorHandler("password does not match", 400));
        }

        user.password = req.body.newPassword;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

// ----------  Forgot Password ---------- //
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate input
        const { error } = forgotPasswordValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        const user = await User.findOne({ email });
        if (!user) return next(new ErrorHandler("User not found", 404));

        // Generate reset token and save it
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset password URL
        const resetPasswordUrl = `${ process.env.CORS_ORIGIN }/password-reset/${ resetToken }`;
        // const resetPasswordUrl = `${process.env.CORS_ORIGIN}/password-reset?token=${resetToken}`;

        const message = `Your password reset link (valid for 10 minutes):\n\n${ resetPasswordUrl }\n\nIf you didn't request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Request",
                message,
            });

            res.status(200).json({
                success: true,
                message: "Password reset link sent successfully"
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorHandler("Email could not be sent", 500));
        }
    } catch (error) {
        next(new ErrorHandler(`Server Error: ${ error.message }`, 500));
    }
};

// ----------  Reset Password ---------- //

exports.resetPassword = async (req, res, next) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        // Validate input
        const { error } = resetPasswordTokenValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        if (newPassword !== confirmPassword) {
            return next(new ErrorHandler("Passwords do not match", 400));
        }

        // Hash the token and find user
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ErrorHandler("Invalid or expired reset token", 400));
        }

        // Update password and clear reset token fields
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        next(new ErrorHandler(`Server Error: ${ error.message }`, 500));
    }
};

// ----------  Watchlist Controls ---------- //

exports.addToWatchlist = async (req, res, next) => {
    try {
        const productId = req.params.productId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        // Find or create watchlist
        let watchlist = await Watchlist.findOne({ user: req.user._id });
        if (!watchlist) {
            watchlist = new Watchlist({ user: req.user._id, products: [] });
        }

        // Check if product is already in watchlist
        if (watchlist.products.includes(productId)) {
            return next(new ErrorHandler("Product already in watchlist", 400));
        }

        watchlist.products.push(productId);
        await watchlist.save();
        await watchlist.populate('products', 'name price productImages ratings');

        res.status(200).json({
            success: true,
            message: "Product added to watchlist",
            data: watchlist
        });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

exports.getWatchlist = async (req, res, next) => {
    try {
        let watchlist = await Watchlist.findOne({ user: req.user._id })
            .populate('products', 'name price productImages ratings');

        if (!watchlist) {
            watchlist = { products: [] };
        }

        res.status(200).json({
            success: true,
            data: watchlist
        });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

exports.removeFromWatchlist = async (req, res, next) => {
    try {
        const productId = req.params.productId;

        const watchlist = await Watchlist.findOne({ user: req.user._id });
        if (!watchlist) {
            return next(new ErrorHandler("Watchlist not found", 404));
        }

        watchlist.products = watchlist.products.filter(
            product => product.toString() !== productId
        );

        await watchlist.save();
        await watchlist.populate('products', 'name price productImages ratings');

        res.status(200).json({
            success: true,
            message: "Product removed from watchlist",
            data: watchlist
        });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};



//////////////////////////////////////////// ADMIN SIDE ////////////////////////////////////////////

// ----------  Get All Users ---------- //
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ create_At: 1 });

        if (!users) return next(new ErrorHandler("No users found", 404));

        const totalCount = await User.countDocuments({ role: "user" });

        res.status(200).json({
            success: true,
            message: "Get All User Successfully",
            count: totalCount,
            data: users
        });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};

// ----------  Get User Details ---------- //
exports.getUserDetails = async (req, res, next) => {
    try {
        if (!req.params?.id) {
            return next(new ErrorHandler("User ID is required", 400));
        }

        const [user, watchlist, cart] = await Promise.all([
            User.findById(req.params.id).lean(),
            Watchlist.findOne({ user: req.params.id }).lean(),
            Cart.findOne({ user: req.params.id }).lean()
        ]);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Add watchlist and cart quantities directly to user object
        user.watchlistQuantity = watchlist?.products?.length || 0;
        user.cartQuantity = cart?.totalQuantity || 0;

        const userDetails = {
            success: true,
            user
        };

        res.status(200).json(userDetails);

    } catch (err) {
        next(new ErrorHandler(
            err.name === 'CastError'
                ? "Invalid user ID format"
                : `Server Error: ${ err.message }`,
            err.name === 'CastError' ? 400 : 500
        ));
    }
};

// ----------  Update User ---------- //
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, phone, role } = req.body;

        // Validate input (exclude profileImage from validation)
        const { error } = registerValidation(req.body);
        if (error) return next(new ErrorHandler(error.details[0].message, 400));

        // Check if user exists
        const userExists = await User.findById(req.params.id);
        if (!userExists) return next(new ErrorHandler("User not found", 404));

        // Update user details
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, phone, role }, { new: true });

        res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
}

// ----------  Delete User ---------- //
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return next(new ErrorHandler("User not found", 404));

        // Delete profile image if exists
        if (user.profileImage) {
            const imagePath = path.join(__dirname, '..', user.profileImage);

            try {
                await fsPromises.unlink(imagePath);
            } catch (error) {
                // Only log error if file exists but couldn't be deleted
                if (error.code !== 'ENOENT') {
                    console.error("Error deleting profile image:", error);
                }
            }
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: "User and profile image deleted successfully" });

    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
}

exports.userWatchlist = async (req, res, next) => {
    try {
        let watchlist = await Watchlist.findOne({ user: req.params.id })
            .populate('products', 'name price productImages ratings');

        if (!watchlist) {
            watchlist = { products: [] };
        }

        res.status(200).json({
            success: true,
            data: watchlist
        });
    } catch (err) {
        next(new ErrorHandler(`Server Error: ${ err.message }`, 500));
    }
};


exports.userCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.params.id })
            .populate('items.product', 'name price productImages');

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: { items: [], total: 0 }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};

exports.userOrder = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.params.id });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (err) {
        next(new ErrorHandler(err.message, 500));
    }
};