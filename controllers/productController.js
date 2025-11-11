const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const User = require("../models/userModel");
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
      create_At: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

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
        users: { totalUsers, totalAdmins, totalUsersToday },
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

// ---------- Get All Products - Admin ---------- //
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("createdUser", "name email");
    const TotalProduct = await Product.countDocuments();

    res.status(200).json({ success: true, TotalProduct, products });
  } catch (err) {
    next(new ErrorHandler(`Failed to fetch products: ${err.message}`, 500));
  }
};

// ---------- Get Single Product ---------- //
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdUser",
      "name email"
    );

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
