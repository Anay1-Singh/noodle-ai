const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// =======================
// ONBOARDING
// =======================
router.post("/onboarding", auth, async (req, res) => {
    try {
        const { name, avatar, height, weight, age, goal } = req.body;

        if (!name || !avatar) {
            return res.status(400).json({ message: "Name and avatar are required" });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name;
        user.avatar = avatar;
        if (height) user.height = height;
        if (weight) user.weight = weight;
        if (age) user.age = age;
        if (goal) user.goal = goal;
        user.onboardingComplete = true;

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpiry;
        delete userObj.otpAttempts;
        delete userObj.otpLastSent;
        delete userObj.otpPurpose;

        res.json({
            message: "Onboarding completed",
            user: userObj
        });
    } catch (err) {
        console.error("ONBOARDING ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// GET CURRENT USER
// =======================
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password -otp -otpExpiry -otpAttempts -otpLastSent -otpPurpose");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (err) {
        console.error("FETCH USER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// CHANGE AVATAR ONLY
// =======================
router.put("/avatar", auth, async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({ message: "Avatar is required" });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.avatar = avatar;
        await user.save();

        res.json({ avatar: user.avatar });
    } catch (err) {
        console.error("AVATAR UPDATE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// UPDATE FULL PROFILE
// =======================
router.post("/profile", auth, async (req, res) => {
    try {
        const { name, bio, age, height, weight, goal, bannerColor, avatar, avatarDecoration, barEffect, bannerTheme } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (age !== undefined) user.age = age;
        if (height !== undefined) user.height = height;
        if (weight !== undefined) user.weight = weight;
        if (goal !== undefined) user.goal = goal;
        if (bannerColor !== undefined) user.bannerColor = bannerColor;
        if (avatar !== undefined) user.avatar = avatar;
        if (avatarDecoration !== undefined) user.avatarDecoration = avatarDecoration;
        if (barEffect !== undefined) user.barEffect = barEffect;
        if (bannerTheme !== undefined) user.bannerTheme = bannerTheme;

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpiry;
        delete userObj.otpAttempts;
        delete userObj.otpLastSent;
        delete userObj.otpPurpose;

        res.json({ message: "Profile updated successfully", user: userObj });
    } catch (err) {
        console.error("PROFILE UPDATE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// GET WELLNESS DATA
// =======================
router.get("/wellness", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.wellnessData || {});
    } catch (err) {
        console.error("FETCH WELLNESS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// SAVE WELLNESS DATA
// =======================
router.post("/wellness", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Merge or replace depending on what frontend sends
        // The frontend will send the entire data object
        user.wellnessData = { ...user.wellnessData, ...req.body };
        await user.save();

        res.json({ message: "Wellness data saved", wellnessData: user.wellnessData });
    } catch (err) {
        console.error("SAVE WELLNESS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
