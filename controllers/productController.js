const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const {
  productValidationSchema,
  productUpdateValidationSchema,
} = require("../validators/productValidation");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

// ----------  Admin Dashboard ---------- //
exports.adminDashboard = async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalUsersToday = await User.countDocuments({
      create_At: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const totalActiveProducts = await Product.countDocuments({
      status: "active",
    });
    const totalInactiveProducts = await Product.countDocuments({
      status: "inactive",
    });
    const productsAddedToday = await Product.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.status(200).json({
      success: true,
      message: "Admin Dashboard",
      data: {
        users: {
          totalUsers,
          totalAdmins,
          totalUsersToday,
        },
        products: {
          totalProducts,
          totalActiveProducts,
          totalInactiveProducts,
          productsAddedToday,
        },
      },
    });
  } catch (err) {
    next(new ErrorHandler(`Server Error: ${err.message}`, 500));
  }
};

// ---------- Create Product ---------- //
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      category,
      brand,
      download_url,
      stock,
      description,
      faqs,
    } = req.body;

    if (!req.files?.length) {
      return next(new ErrorHandler("Product images are required", 400));
    }

    // Safely parse JSON strings
    let parsedDescription, parsedFaqs;
    try {
      parsedDescription =
        typeof description === "string" ? JSON.parse(description) : description;
      parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
    } catch (parseError) {
      return next(
        new ErrorHandler("Invalid JSON format in description or FAQs", 400)
      );
    }

    const validationPayload = {
      name,
      price,
      category,
      brand,
      stock,
      description: parsedDescription,
      faqs: parsedFaqs,
      download_url,
      createdUser: req.user.id,
    };

    const { error } = productValidationSchema.validate(validationPayload);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    // const baseURL = process.env.BASE_URL;
    const productImages = req.files.map((file) => ({
      url: file.secure_url,
      public_id: file.public_id,
    }));

    const newProduct = await Product.create({
      ...validationPayload,
      productImages,
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    return next(new ErrorHandler(err.message, 500));
  }
};

// ---------- Get All Products - Admin --------- //
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("createdUser", "name email");
    const TotalProduct = await Product.countDocuments();

    res.status(200).json({ success: true, TotalProduct, products });
  } catch (err) {
    next(new ErrorHandler(`Failed to fetch products: ${err.message}`, 500));
  }
};

// ---------- Get Single Product --------- //
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdUser",
      "name email"
    );

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(new ErrorHandler(`Failed to fetch product: ${err.message}`, 500));
  }
};

// ---------- Update Product --------- //
exports.updateProduct = async (req, res, next) => {
  try {
    // Create update payload only with fields present in request body
    let updatePayload = {};

    // Handle each field that might be in the request body
    Object.keys(req.body).forEach((key) => {
      if (key === "description" || key === "faqs") {
        try {
          updatePayload[key] =
            typeof req.body[key] === "string"
              ? JSON.parse(req.body[key])
              : req.body[key];
        } catch (parseError) {
          throw new Error(`Invalid JSON format in ${key}`);
        }
      } else {
        updatePayload[key] = req.body[key];
      }
    });

    // Validate only the fields being updated
    const { error } = productUpdateValidationSchema.validate(updatePayload, {
      allowUnknown: true,
      stripUnknown: true,
      presence: "optional",
    });

    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    return next(
      new ErrorHandler(`Error updating product: ${err.message}`, 500)
    );
  }
};

// ---------- Delete Product --------- //
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Delete all associated images
    for (const image of product.productImages) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        if (error.code !== "ENOENT") {
          return next(
            new ErrorHandler(`Error deleting image: ${error.message}`, 500)
          );
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to delete product: ${err.message}`, 500)
    );
  }
};

// ---------- Update Product Images --------- //
exports.updateProductImages = async (req, res, next) => {
  try {
    // Basic validation
    if (!req.files || req.files.length === 0) {
      return next(new ErrorHandler("Please upload at least one image", 400));
    }

    // Validate each file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    for (const file of req.files) {
      if (file.size > maxSize) {
        // Clean up all uploaded files
        await Promise.all(req.files.map((f) => fsPromises.unlink(f.path)));
        return next(
          new ErrorHandler(
            `Image ${file.originalname} size should be less than 5MB`,
            400
          )
        );
      }

      if (!allowedTypes.includes(file.mimetype)) {
        await Promise.all(req.files.map((f) => fsPromises.unlink(f.path)));
        return next(
          new ErrorHandler("Please upload only JPG, JPEG or PNG images", 400)
        );
      }
    }

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      await Promise.all(req.files.map((f) => fsPromises.unlink(f.path)));
      return next(new ErrorHandler("Product not found", 404));
    }

    // Delete all existing images
    for (const oldImage of product.productImages) {
      try {
        await cloudinary.uploader.destroy(oldImage.public_id);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Error deleting old image:", error);
        }
      }
    }
    const baseURL = process.env.BASE_URL;
    // Prepare new images data
    const newImages = req.files.map((file) => ({
      url: file.secure_url,
      public_id: file.public_id,
    }));

    // Replace old images with new ones
    product.productImages = newImages;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      data: product,
    });
  } catch (err) {
    // Clean up uploaded files if error occurs
    if (req.files) {
      await Promise.all(
        req.files.map((file) =>
          fsPromises.unlink(file.path).catch(console.error)
        )
      );
    }
    next(new ErrorHandler(`Server Error: ${err.message}`, 500));
  }
};

// ---------- Create/Update Product Review by user---------- //
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      category,
      brand,
      download_url,
      stock,
      description,
      faqs,
    } = req.body;

    if (!req.files?.length) {
      return next(new ErrorHandler("Product images are required", 400));
    }

    // Parse JSON safely
    let parsedDescription, parsedFaqs;
    try {
      parsedDescription =
        typeof description === "string" ? JSON.parse(description) : description;
      parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
    } catch (parseError) {
      return next(
        new ErrorHandler("Invalid JSON format in description or FAQs", 400)
      );
    }

    // Validate the payload
    const validationPayload = {
      name,
      price,
      category,
      brand,
      stock,
      description: parsedDescription,
      faqs: parsedFaqs,
      download_url,
      createdUser: req.user.id,
    };

    const { error } = productValidationSchema.validate(validationPayload);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    // ✅ Upload images to Cloudinary
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      // Optional: remove local copy to keep things clean
      await fsPromises.unlink(file.path);
    }

    // ✅ Create product with Cloudinary image URLs
    const newProduct = await Product.create({
      ...validationPayload,
      productImages: uploadedImages,
    });

    res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler(`Server Error: ${err.message}`, 500));
  }
};

// ---------- Get Single Product Reviews ---------- //
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Extract only the reviews array from the product
    const reviews = product.reviews;

    if (reviews.length === 0) {
      return next(new ErrorHandler("No reviews found for this product", 404));
    }

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to fetch reviews: ${err.message}`, 500)
    );
  }
};

// ---------- Delete Review by user--------- //
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Filter out the review
    product.reviews = product.reviews.filter(
      (review) => review.user.toString() !== req.user._id.toString()
    );

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to delete review: ${err.message}`, 500)
    );
  }
};

// ---------- Update Review usnig review ID by - admin--------- //
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId, reviewId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return next(
        new ErrorHandler("Please provide a rating between 1 and 5", 400)
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return next(new ErrorHandler("Review not found or unauthorized", 404));
    }

    product.reviews[reviewIndex].rating = Number(rating);
    product.reviews[reviewIndex].comment = comment;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: product.reviews[reviewIndex],
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to update review: ${err.message}`, 500)
    );
  }
};

// ---------- Delete Review by reviewId - admin--------- //
exports.deleteReviewById = async (req, res, next) => {
  try {
    const { id: productId, reviewId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const reviewExists = product.reviews.some(
      (review) => review._id.toString() === reviewId
    );

    if (!reviewExists) {
      return next(new ErrorHandler("Review not found", 404));
    }
    exports.createProduct = async (req, res, next) => {
      try {
        const {
          name,
          price,
          category,
          brand,
          download_url,
          stock,
          description,
          faqs,
        } = req.body;

        if (!req.files?.length) {
          return next(new ErrorHandler("Product images are required", 400));
        }

        // Parse JSON safely
        let parsedDescription, parsedFaqs;
        try {
          parsedDescription =
            typeof description === "string"
              ? JSON.parse(description)
              : description;
          parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
        } catch (parseError) {
          return next(
            new ErrorHandler("Invalid JSON format in description or FAQs", 400)
          );
        }

        // Validate the payload
        const validationPayload = {
          name,
          price,
          category,
          brand,
          stock,
          description: parsedDescription,
          faqs: parsedFaqs,
          download_url,
          createdUser: req.user.id,
        };

        const { error } = productValidationSchema.validate(validationPayload);
        if (error) {
          return next(new ErrorHandler(error.details[0].message, 400));
        }

        // ✅ Upload images to Cloudinary
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          uploadedImages.push({
            public_id: result.public_id,
            url: result.secure_url,
          });

          // Optional: remove local copy to keep things clean
          await fsPromises.unlink(file.path);
        }

        // ✅ Create product with Cloudinary image URLs
        const newProduct = await Product.create({
          ...validationPayload,
          productImages: uploadedImages,
        });

        res.status(201).json({
          success: true,
          product: newProduct,
        });
      } catch (err) {
        console.error(err);
        return next(new ErrorHandler(`Server Error: ${err.message}`, 500));
      }
    };

    // Filter out the review by reviewId
    product.reviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId
    );

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to delete review: ${err.message}`, 500)
    );
  }
};
