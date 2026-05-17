export const loadChatHistory = async (tierFilter) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`, {
      credentials: "include"
    });

    if (!res.ok) {
      console.error("loadChatHistory: server returned", res.status);
      return [];
    }
    
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
    // Build the finalized chat object matching the MongoDB schema exactly:
    const finalizedChat = { ...chatData, tier, id: chatId };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(finalizedChat)
    });

    if (!res.ok) {
      console.error("saveChatSession: server returned", res.status, await res.text());
    }
  } catch (err) {
    console.error("Failed to save chat session:", err);
  }
};

export const deleteChatSession = async (tier, chatId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!res.ok) {
      console.error("deleteChatSession: server returned", res.status);
    }
  } catch (err) {
    console.error("Failed to delete chat session:", err);
  }
};
