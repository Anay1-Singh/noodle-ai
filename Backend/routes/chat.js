const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// GET /api/chat/history — returns the user's full chatHistory array
router.get("/history", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("chatHistory");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.chatHistory || []);
    } catch (err) {
        console.error("GET CHAT HISTORY ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/chat/save — receives id, tier, title, messages
router.post("/save", auth, async (req, res) => {
    try {
        const { id, tier, title, messages } = req.body;
        
        if (!id || !tier || !messages) {
            return res.status(400).json({ message: "Missing required chat fields" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.chatHistory) {
            user.chatHistory = [];
        }

        const existingChatIndex = user.chatHistory.findIndex(chat => chat.id === id);

        const chatObj = {
            id,
            tier,
            title: title || "New Chat",
            messages,
            date: new Date().toISOString()
        };

        if (existingChatIndex !== -1) {
            user.chatHistory[existingChatIndex] = chatObj;
        } else {
            user.chatHistory.push(chatObj);
        }

        // Keep maximum 50 chats logic (removing oldest sequentially if exceeding)
        if (user.chatHistory.length > 50) {
            // Sort to ensure oldest dates are at the start, or assume order of insertion holds them.
            // Let's explicitly sort by date descending, then slice 50.
            user.chatHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            user.chatHistory = user.chatHistory.slice(0, 50);
        }

        await user.save();
        res.json({ message: "Chat saved successfully" });
    } catch (err) {
        console.error("SAVE CHAT ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/chat/:chatId — removes the chat with that id and saves
router.delete("/:chatId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.chatHistory) return res.json({ message: "Deleted" });

        user.chatHistory = user.chatHistory.filter(chat => chat.id !== req.params.chatId);
        await user.save();

        res.json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error("DELETE CHAT ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
