const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const ErrorHandler = require("./utils/errorHandler");

// Serve static files (uploads folder) with CORS

// Route Imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const errorMiddleware = require("./middlewares/error");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Middleware.
app.use(express.json()); // for parsing JSON
app.use(express.urlencoded({ extended: true })); // for parsing form data
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "http://localhost:3000", process.env.FRONT_END_URL], // Adjust for prod
      },
    },
  })
);
// Allow CORS for all routes
app.use(
  cors({
    origin: "*", // or specify your frontend domain like 'https://your-frontend-site.com',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use('/uploads', express.static('uploads'));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// Error Middleware

// Handle 404 errors
// app.all(/(.*)/, (req, res, next) => {
//     next(new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});
app.use(errorMiddleware);
module.exports = app;
