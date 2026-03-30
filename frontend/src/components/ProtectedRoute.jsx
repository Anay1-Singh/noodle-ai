import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — guards authenticated routes.
 *
 * 1. Reads `noodle_token` from localStorage.
 * 2. If missing → redirect to /login immediately.
 * 3. If present → validates via GET /api/user/me.
 *    • Valid   → stores fresh user data, renders children.
 *    • Invalid → clears stale token, redirects to /login.
 */
export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

    useEffect(() => {
        fetch("http://localhost:5000/api/user/me", {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Invalid token");
                return res.json();
            })
            .then((data) => {
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                setStatus("authenticated");
            })
            .catch(() => {
                localStorage.removeItem("user");
                setStatus("unauthenticated");
            });
    }, []);

    if (status === "loading") {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#050210",
                }}
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        border: "2.5px solid rgba(255,255,255,0.08)",
                        borderTopColor: "rgba(200,210,255,0.5)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    return children;
}
