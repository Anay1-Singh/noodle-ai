export const loadChatHistory = async (tierFilter) => {
  try {
    const token = localStorage.getItem("noodle_token");
    if (!token) return [];

    const res = await fetch("http://localhost:5000/api/chat/history", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    return tierFilter ? arr.filter(c => c.tier === tierFilter) : arr;
  } catch (err) {
    console.error("Failed to load chat history:", err);
    return [];
  }
};

export const saveChatSession = async (tier, chatId, chatData) => {
  try {
    const token = localStorage.getItem("noodle_token");
    if (!token) return;

    // Build the finalized chat object matching the MongoDB schema exactly:
    const finalizedChat = { ...chatData, tier, id: chatId };

    await fetch("http://localhost:5000/api/chat/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify(finalizedChat)
    });
  } catch (err) {
    console.error("Failed to save chat session:", err);
  }
};

export const deleteChatSession = async (tier, chatId) => {
  try {
    const token = localStorage.getItem("noodle_token");
    if (!token) return;

    await fetch(`http://localhost:5000/api/chat/${chatId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });
  } catch (err) {
    console.error("Failed to delete chat session:", err);
  }
};
