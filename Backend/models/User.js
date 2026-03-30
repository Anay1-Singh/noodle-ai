const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    default: ""
  },

  avatar: {
    type: String,
    default: ""
  },

  height: {
    type: Number,
    default: null
  },

  weight: {
    type: Number,
    default: null
  },

  age: {
    type: Number,
    default: null
  },

  goal: {
    type: String,
    default: ""
  },

  onboardingComplete: {
    type: Boolean,
    default: false
  },

  bio: {
    type: String,
    default: ""
  },

  bannerColor: {
    type: String,
    default: "#5865f2"
  },

  avatarDecoration: {
    type: String,
    default: "none"
  },

  barEffect: {
    type: String,
    default: "none"
  },

  bannerTheme: {
    type: String,
    default: "none"
  },

  password: {
    type: String,
    required: true
  },

  otp: String,

  otpExpiry: Date,

  otpAttempts: {
    type: Number,
    default: 0
  },

  otpLastSent: Date,

  otpPurpose: String, // "signup" | "login" | "password_reset"

  isVerified: {
    type: Boolean,
    default: false
  },

  dailyMessagesUsed: {
    type: Number,
    default: 0
  },

  lastResetDate: {
    type: Date,
    default: Date.now
  },

  isPremium: {
    type: Boolean,
    default: false
  },

  wellnessData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  chatHistory: {
    type: [{
      id: String,
      tier: String,      // "easy", "medium", "hard"
      title: String,
      messages: [{     // Array of message objects {role: 'user'|'ai', text: String}
        role: String,
        text: String
      }],
      date: String
    }],
    default: []
  }
});

module.exports = mongoose.model("User", UserSchema);