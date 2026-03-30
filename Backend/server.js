require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const { clean: xssClean } = require("xss-clean/lib/xss");
const cookieParser = require("cookie-parser");

const app = express();

// Global rate limiter — 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://openrouter.ai"],
      },
    },
    frameguard: { action: "deny" },
    noSniff: true,
  })
);
app.use(cookieParser());
app.use(limiter);
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "15kb" }));
app.use(hpp());
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});
app.use((req, res, next) => {
  if (req.body) req.body = xssClean(req.body);
  if (req.params) req.params = xssClean(req.params);
  next();
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chat", require("./routes/chat"));


// Test route (check backend)
app.get("/", (req, res) => {
  res.send("Noodle Backend is running");
});

// 🔴 CONNECT TO MONGODB (EDIT THIS LINE ONLY)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start server only after DB connects
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000 🚀");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error);
  });
