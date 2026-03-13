const cloudinary = require("cloudinary").v2;
const path = require("path");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");
const {
  productValidationSchema,
  productUpdateValidationSchema,
} = require("../validators/productValidation");
const fsPromises = require("fs").promises;

// ----------  Admin Dashboard ---------- //
exports.adminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const totalProducts = await Product.countDocuments();
    const totalActiveProducts = await Product.countDocuments({
      status: "Active",
    });
    const totalInactiveProducts = await Product.countDocuments({
      status: "Inactive",
    });
    const productsAddedToday = await Product.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      message: "Admin Dashboard",
      data: {
        users: { totalUsers, totalAdmins, totalUsersToday },
        products: {
          totalProducts,
          totalActiveProducts,
          totalInactiveProducts,
          productsAddedToday,
        },
        orders: {
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
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

    // Parse description and FAQs safely
    let parsedDescription, parsedFaqs;
    try {
      parsedDescription =
        typeof description === "string" ? JSON.parse(description) : description;
      parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
    } catch {
      return next(
        new ErrorHandler("Invalid JSON format in description or FAQs", 400)
      );
    }

    // Validate input
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

    // ✅ Upload all images to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });

      // Clean up local file if exists
      if (file.path && !file.path.startsWith("http")) {
        await fsPromises.unlink(file.path);
      }
    }

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
    next(new ErrorHandler(`Server Error: ${err.message}`, 500));
  }
};

// Helper to escape special regex characters to prevent regex injection
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Get All Products ---------- //
exports.getAllProducts = async (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, minRating, status, page, limit } = req.query;

    const conditions = [];

    if (keyword) {
      const safe = escapeRegex(keyword);
      conditions.push({
        $or: [
          { name: { $regex: safe, $options: "i" } },
          { category: { $regex: safe, $options: "i" } },
          { brand: { $regex: safe, $options: "i" } },
        ],
      });
    }
    if (category) conditions.push({ category: { $regex: escapeRegex(category), $options: "i" } });
    if (brand) conditions.push({ brand: { $regex: escapeRegex(brand), $options: "i" } });
    if (status) conditions.push({ status });
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
      conditions.push({ price: priceFilter });
    }
    if (minRating !== undefined) {
      conditions.push({ ratings: { $gte: Number(minRating) } });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const pageNum = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const pageSize = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20;
    const skip = (pageNum - 1) * pageSize;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate({ path: "reviews.user", select: "name email" })
        .skip(skip)
        .limit(pageSize),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / pageSize),
      products,
    });
  } catch (err) {
    next(new ErrorHandler(`Failed to fetch products: ${err.message}`, 500));
  }
};

// ---------- Get Single Product ---------- //
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "reviews.user",
      select: "name email",
    });

    if (!product) return next(new ErrorHandler("Product not found", 404));

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(new ErrorHandler(`Failed to fetch product: ${err.message}`, 500));
  }
};

// ---------- Update Product ---------- //
exports.updateProduct = async (req, res, next) => {
  try {
    const updatePayload = {};

    for (const key of Object.keys(req.body)) {
      if (["description", "faqs"].includes(key)) {
        try {
          updatePayload[key] =
            typeof req.body[key] === "string"
              ? JSON.parse(req.body[key])
              : req.body[key];
        } catch {
          throw new Error(`Invalid JSON format in ${key}`);
        }
      } else updatePayload[key] = req.body[key];
    }

    const { error } = productUpdateValidationSchema.validate(updatePayload, {
      allowUnknown: true,
      stripUnknown: true,
      presence: "optional",
    });
    if (error) return next(new ErrorHandler(error.details[0].message, 400));

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    );
    if (!product) return next(new ErrorHandler("Product not found", 404));

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(new ErrorHandler(`Error updating product: ${err.message}`, 500));
  }
};

// ---------- Delete Product ---------- //
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    // Delete all images from Cloudinary
    for (const image of product.productImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(new ErrorHandler(`Failed to delete product: ${err.message}`, 500));
  }
};

// ---------- Update Product Images ---------- //
exports.updateProductImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return next(new ErrorHandler("Please upload at least one image", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found", 404));

    // Delete old images from Cloudinary
    for (const oldImage of product.productImages) {
      await cloudinary.uploader.destroy(oldImage.public_id);
    }

    // Upload new ones
    const newImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      newImages.push({ url: result.secure_url, public_id: result.public_id });

      if (file.path && !file.path.startsWith("http")) {
        await fsPromises.unlink(file.path);
      }
    }

    product.productImages = newImages;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product images updated successfully",
      data: product,
    });
  } catch (err) {
    if (req.files) {
      await Promise.all(
        req.files.map((file) => fsPromises.unlink(file.path).catch(() => {}))
      );
    }
    next(new ErrorHandler(`Server Error: ${err.message}`, 500));
  }
};

// create product reviews
exports.createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return next(
        new ErrorHandler("Please provide a rating between 1 and 5", 400)
      );
    }

    if (!comment) {
      return next(new ErrorHandler("Please Enter a Comment", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Use findIndex to check existing review by this user
    const existingReviewIndex = product.reviews.findIndex(
      (review) => review.user.toString() === userId.toString()
    );

    const reviewObj = {
      user: userId,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    if (existingReviewIndex >= 0) {
      // Update existing review
      product.reviews[existingReviewIndex] = {
        ...(product.reviews[existingReviewIndex].toObject?.() ??
          product.reviews[existingReviewIndex]),
        ...reviewObj,
      };
    } else {    
      // Add new review
      product.reviews.push(reviewObj);
    }

    // Recalculate ratings & numReviews
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum, r) => sum + Number(r.rating),
        0
      );
      product.ratings = Number(
        (totalRating / product.reviews.length).toFixed(1)
      );
    } else {
      product.ratings = 0;
    }
    product.numReviews = product.reviews.length;

    await product.save();

    // populate properly
    await product.populate({ path: "reviews.user", select: "name email" });

    // return the updated/created review
    const returnedReview =
      existingReviewIndex >= 0
        ? product.reviews[existingReviewIndex]
        : product.reviews[product.reviews.length - 1];

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: returnedReview,
    });
  } catch (err) {
    return next(
      new ErrorHandler(`Failed to create review: ${err.message}`, 500)
    );
  }
};

// get single product reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate({
      path: "reviews.user",
      select: "name email",
    });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Extract only the reviews array from the product
    // const reviews = product.reviews;

    // if (reviews.length === 0) {
    //     return next(new ErrorHandler("No reviews found for this product", 404));
    // }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
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

    const userId = req.user.id || req.user._id;

    // Filter out the review
    product.reviews = product.reviews.filter(
      (review) => review.user.toString() !== userId.toString()
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

// Update Review usnig review ID by - admin
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

// Delete Review by reviewId - admin
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
