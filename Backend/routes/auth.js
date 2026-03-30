const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const Joi = require("joi");

const sendOTP = require("../utils/sendOTP");
const User = require("../models/User");

const router = express.Router();

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(100).required()
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication requests, please try again later." }
});
router.use(authLimiter);

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
}


// =======================
// SIGNUP
// =======================
router.post("/signup", async (req, res) => {
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = value;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();

    const user = new User({
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      otpAttempts: 0,
      otpLastSent: Date.now(),
      otpPurpose: "signup",
    });

    await user.save();
    await sendOTP(email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      requiresOTP: true,
      email,
      purpose: "signup",
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// LOGIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      // User signed up but never verified — resend signup OTP
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Cooldown protection
      if (user.otpLastSent && Date.now() - user.otpLastSent < 60000) {
        return res.status(200).json({
          message: "OTP already sent. Please check your email.",
          requiresOTP: true,
          email,
          purpose: "signup",
        });
      }

      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;
      user.otpAttempts = 0;
      user.otpLastSent = Date.now();
      user.otpPurpose = "signup";

      await user.save();
      await sendOTP(email, otp);

      return res.status(200).json({
        message: "Please verify your email. OTP sent.",
        requiresOTP: true,
        email,
        purpose: "signup",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Cooldown protection (60 seconds)
    if (user.otpLastSent && Date.now() - user.otpLastSent < 60000) {
      return res.status(200).json({
        message: "OTP already sent. Please check your email.",
        requiresOTP: true,
        email,
        purpose: "login",
      });
    }

    // Generate and send login OTP
    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    user.otpLastSent = Date.now();
    user.otpPurpose = "login";

    await user.save();
    await sendOTP(email, otp);

    res.json({
      message: "OTP sent to your email",
      requiresOTP: true,
      email,
      purpose: "login",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// VERIFY OTP
// =======================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Purpose validation
    if (user.otpPurpose !== purpose) {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    // For signup — skip if already verified
    if (purpose === "signup" && user.isVerified) {
      return res.json({ message: "User already verified" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Request new OTP.",
      });
    }

    // Debug: log what we're comparing
    console.log("OTP DEBUG:", {
      stored: user.otp,
      storedType: typeof user.otp,
      received: otp,
      receivedType: typeof otp,
    });

    const storedOtpStr = String(user.otp);
    const receivedOtpStr = String(otp);

    let isMatch = false;
    if (storedOtpStr.length === receivedOtpStr.length && storedOtpStr.length > 0) {
      isMatch = crypto.timingSafeEqual(Buffer.from(storedOtpStr), Buffer.from(receivedOtpStr));
    }

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP correct — clear OTP fields
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpPurpose = null;

    if (purpose === "signup") {
      user.isVerified = true;
    }

    await user.save();

    // Issue JWT for both signup and login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("noodle_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: purpose === "signup" ? "Email verified successfully" : "Login successful",
      onboardingComplete: user.onboardingComplete,
      user: {
        name: user.name,
        avatar: user.avatar,
        height: user.height,
        weight: user.weight,
        age: user.age,
        goal: user.goal,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// RESEND OTP (Anti Spam)
// =======================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cooldown protection (60 seconds)
    if (user.otpLastSent && Date.now() - user.otpLastSent < 60000) {
      return res.status(429).json({
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    user.otpLastSent = Date.now();
    // Keep the existing otpPurpose

    await user.save();
    await sendOTP(email, otp);

    res.json({
      message: "New OTP sent",
    });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// LOGOUT
// =======================
router.post("/logout", (req, res) => {
  res.clearCookie("noodle_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;