"use client";

import { useState } from "react";

// No newsletter-specific keys exist in SiteSettings — copy is hardcoded here.
// If you add keys (e.g. home_newsletter_heading) to the schema and SiteSettings
// interface later, swap in settings.home_newsletter_heading ?? "Stay Close to the Cause".

export default function NewsletterCTA() {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed. Welcome onboard!");
        setEmail("");
      } else {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section style={{ background: "#161616", borderTop: "1px solid #1F1F1F" }}>
      <div
        style={{
          maxWidth: "640px", margin: "0 auto",
          padding: "96px clamp(24px, 6vw, 80px)",
          textAlign: "center",
        }}
      >
        <p style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "#C9952A", marginBottom: "16px",
        }}>
          Newsletter
        </p>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600, color: "#F0EDE8",
          lineHeight: 1.15, marginBottom: "16px",
        }}>
          Stay Close to the Cause
        </h2>

        <p style={{ fontSize: "15px", color: "#706B63", lineHeight: 1.75, marginBottom: "36px" }}>
          Monthly updates on our programmes, impact reports, and ways to give.
        </p>

        {status === "success" ? (
          <p style={{
            fontSize: "15px", color: "#5DBF84",
            padding: "16px 24px", background: "rgba(42,122,74,0.1)",
            borderRadius: "8px", border: "1px solid rgba(42,122,74,0.2)",
          }}>
            {message}
          </p>
        ) : (
          <div style={{ display: "flex", gap: "10px", maxWidth: "440px", margin: "0 auto" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="your@email.com"
              style={{
                flex: 1, padding: "12px 16px",
                background: "#0D0D0D", border: "1px solid #2A2A2A",
                borderRadius: "8px", color: "#F0EDE8", fontSize: "14px", outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#7A5A1A")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#2A2A2A")}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading" || !email}
              style={{
                padding: "12px 24px",
                background: status === "loading" ? "#4A3A14" : "#C9952A",
                color: status === "loading" ? "#706B63" : "#0D0D0D",
                border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", transition: "background 0.15s",
                letterSpacing: "0.04em",
              }}
            >
              {status === "loading" ? "…" : "Subscribe"}
            </button>
          </div>
        )}

        {status === "error" && (
          <p style={{ fontSize: "12px", color: "#E07A5A", marginTop: "10px" }}>{message}</p>
        )}

        <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "16px" }}>
          No spam. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}