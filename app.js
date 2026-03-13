const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const ErrorHandler = require("./utils/errorHandler");

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
// Allow CORS for configured origins
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting for auth routes (100 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for all other API routes (300 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/product", apiLimiter, productRoutes);
app.use("/api/cart", apiLimiter, cartRoutes);
app.use("/api/order", apiLimiter, orderRoutes);

// Handle 404 errors
app.all("*", (req, res, next) => {
    next(new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404));
});

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
