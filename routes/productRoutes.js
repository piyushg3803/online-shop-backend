// External Imports
const express = require("express");

// Internal Imports
const { authMiddleware, authorizeRoles } = require("../middlewares/auth");
const { multipleProductUpload } = require("../middlewares/upload"); // Middleware for file uploads
const productController = require("../controllers/productController"); // Import product controller

const router = express.Router();

// deshbord
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  productController.adminDashboard
);

// create a new Product
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("admin"),
  multipleProductUpload,
  productController.createProduct
);

// get all Products (Admin only)
router.get("/", productController.getAllProducts);

// get a single Product by ID
router.get("/:id", productController.getSingleProduct);

// update a Product by ID (Admin only)
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  productController.updateProduct
);

// delete a Product by ID (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  productController.deleteProduct
);

// update product images (Admin only)
router.put(
  "/:id/images",
  authMiddleware,
  authorizeRoles("admin"),
  multipleProductUpload,
  productController.updateProductImages
);

// Review Routes
// Public route
router.get("/reviews/:productId", productController.getProductReviews);

// Authenticated user routes
router.post(
  "/reviews/:productId",
  authMiddleware,
  productController.createProductReview
);
router.delete(
  "/reviews/:productId/user",
  authMiddleware,
  productController.deleteReview
);

// Admin review management routes
router
  .route("/:productId/review/:reviewId")
  .put(authMiddleware, authorizeRoles("admin"), productController.updateReview)
  .delete(
    authMiddleware,
    authorizeRoles("admin"),
    productController.deleteReviewById
  );

module.exports = router;
