const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many AI requests. Please slow down." }
});
// const fetch = require("node-fetch");

const TIER_LIMITS = { easy: 15, medium: 15, hard: 15 };

// Helper: check if date is a different day than today
function isNewDay(date) {
    if (!date) return true;
    const now = new Date();
    const d = new Date(date);
    return now.getFullYear() !== d.getFullYear() ||
        now.getMonth() !== d.getMonth() ||
        now.getDate() !== d.getDate();
}

// GET /api/ai/credits
router.get("/credits", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Reset if new day
        if (isNewDay(user.lastResetDate)) {
            user.dailyMessagesUsed = 0;
            user.lastResetDate = new Date();
            await user.save();
        }

        const tier = req.query.tier || "easy";
        const limit = TIER_LIMITS[tier] || 5;

        res.json({
            used: user.dailyMessagesUsed,
            limit,
            isPremium: user.isPremium || false
        });
    } catch (err) {
        console.error("CREDITS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/ai/chat
router.post("/chat", auth, aiLimiter, async (req, res) => {
    const { message, tier } = req.body;

    if (!message || !tier) {
        return res.status(400).json({ message: "Missing message or tier" });
    }

    try {
        const user = await User.findById(req.user.userId).select('+name +age +weight +height +goal +isPremium +dailyMessagesUsed +wellnessData');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Reset if new day
        if (isNewDay(user.lastResetDate)) {
            user.dailyMessagesUsed = 0;
            user.lastResetDate = new Date();
            await user.save();
        }

        // Check limit and reserve token atomically for non-premium
        const limit = TIER_LIMITS[tier] || 5;
        let tokenReserved = false;

        if (!user.isPremium) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: req.user.userId, dailyMessagesUsed: { $lt: limit } },
                { $inc: { dailyMessagesUsed: 1 } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(403).json({ message: "Daily limit reached" });
            }
            tokenReserved = true;
        }

        let userContext = "";
        try {
            const parts = [];
            if (user.name) parts.push(`The user you are coaching is named ${user.name}.`);
            
            const stats = [];
            if (user.age) stats.push(`are ${user.age} years old`);
            if (user.weight) stats.push(`weigh ${user.weight}kg`);
            if (user.height) stats.push(`are ${user.height}cm tall`);
            
            if (stats.length > 0) {
                if (stats.length === 1) parts.push(`They ${stats[0]}.`);
                else if (stats.length === 2) parts.push(`They ${stats[0]} and ${stats[1]}.`);
                else parts.push(`They ${stats[0]}, ${stats[1]}, and ${stats[2]}.`);
            }
            
            if (user.goal) parts.push(`Their current fitness goal is ${user.goal}.`);
            if (tier) parts.push(`They are on the ${tier} training tier.`);
            
            if (parts.length > 0) userContext = parts.join(" ") + "\n\n";
        } catch (err) {}

        let systemPrompt = "";

        const formatInstructions = "Format your responses exactly like this: write in short natural paragraphs, never more than 2-3 sentences per paragraph. Use a single line break between paragraphs. Only use bullet points if the user asks for a list or plan. Use emojis sparingly and only where they feel natural — not on every line. For casual messages like hi or thanks, reply in one sentence only. Match the length of your reply to the complexity of the question — simple question means short answer, detailed question means detailed answer but still broken into short paragraphs. Never use headers or bold text unless the user asks for a structured plan. Write like you are texting a friend who asked a fitness question — natural, warm, confident, no fluff.";

        // EASY
        if (tier === "easy") {
            systemPrompt = userContext + `You are Noodle, a chill friendly fitness coach. Keep ALL replies short and conversational. For greetings like hi/hello reply in ONE sentence max with an emoji. Only give long detailed responses if the user explicitly asks for a plan, routine, or explanation. Never give unrequested lists, sections, or headers. Talk like a supportive friend who knows fitness. ${formatInstructions}`;
        }

        // MEDIUM
        else if (tier === "medium") {
            systemPrompt = userContext + `You are Noodle, a direct gym coach focused on gains. Keep replies short and punchy. For greetings reply in one sentence with an emoji. Only go detailed when the user asks for something specific like a program or macro calculation. No unrequested bullet points or sections. Talk like a knowledgeable gym buddy. ${formatInstructions}`;
        }

        // HARD
        else if (tier === "hard") {
            systemPrompt = userContext + `You are Noodle, an elite competition coach. Replies are short and precise. Greetings get one sentence back. Only give full protocols when explicitly requested. No filler, no unrequested info. Every word counts. ${formatInstructions}`;
        }

        const openRouterMaxTokens = message.length < 30 ? 150 : 500;

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.AI_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3-8b-instruct",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message },
                    ],
                    temperature: 0.7,
                    max_tokens: openRouterMaxTokens,
                    stream: true,
                }),
            }
        );

        if (!response.ok) {
            let errorData = {};
            try { errorData = await response.json(); } catch(e){}
            console.error("OpenRouter Error:", errorData);
            
            // Refund token if error occurred
            if (tokenReserved) {
                await User.updateOne({ _id: req.user.userId }, { $inc: { dailyMessagesUsed: -1 } });
            }

            return res
                .status(500)
                .json({ message: errorData.error?.message || "AI request failed" });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const decoder = new TextDecoder();
        let buffer = "";

        for await (const chunk of response.body) {
            buffer += decoder.decode(chunk, { stream: true });
            const parts = buffer.split("\n");
            buffer = parts.pop();
            
            for (const line of parts) {
                if (!line.trim() || line.trim() === "data: [DONE]") continue;
                if (line.startsWith("data: ")) {
                    try {
                        const parsed = JSON.parse(line.replace(/^data: /, ""));
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            res.write(content);
                        }
                    } catch (e) {
                        // ignore partial chunk json errors
                    }
                }
            }
        }
        
        res.end();

    } catch (error) {
        console.error("AI SERVER ERROR:", error);
        res.status(500).json({ message: "AI server error" });
    }
});

module.exports = router;