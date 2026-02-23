"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Heart, RefreshCw, CheckCircle2, Copy, Check } from "lucide-react";
import type { Campaign } from "@/lib/types/app";

const PRESET_AMOUNTS = [250, 500, 1000];

// PayPal removed — awaiting API access
// type PaymentMethod = "paypal" | "bank" | "crypto";
type PaymentMethod = "bank" | "crypto";

const BITCOIN_ADDRESS = "1J5NKwA7bKk9agwVsHnc26McKNiNrCED79";

interface Props {
  campaigns?: Pick<Campaign, "id" | "title" | "slug" | "status">[];
  defaultCampaignId?: string;
  presetAmounts?: number[];
}

export default function DonationForm({
  campaigns = [],
  defaultCampaignId,
  presetAmounts = PRESET_AMOUNTS,
}: Props) {
  const [method,          setMethod]          = useState<PaymentMethod>("bank");
  const [amount,          setAmount]          = useState<number | "">(250);
  const [customAmount,    setCustomAmount]     = useState("");
  const [isCustom,        setIsCustom]        = useState(false);
  const [email,           setEmail]           = useState("");
  const [name,            setName]            = useState("");
  const [campaignId,      setCampaignId]      = useState(defaultCampaignId ?? "");
  const [isRecurring,     setIsRecurring]     = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [bankDone,        setBankDone]        = useState(false);
  const [copied,          setCopied]          = useState(false);

  const finalAmount      = isCustom ? parseFloat(customAmount) : (amount as number);
  const isValid          = finalAmount >= 1 && (method === "crypto" || email.includes("@"));
  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  /* ── PayPal handler (commented out — no API access yet) ──────────────────
  async function handlePayPal(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount:            finalAmount,
          currency:          "USD",
          campaign_id:       campaignId || null,
          campaign_slug:     selectedCampaign?.slug ?? null,
          donor_name:        name || null,
          is_recurring:      isRecurring,
          newsletter_opt_in: newsletterOptIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
      window.location.href = data.approval_url;
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }
  ── end PayPal ─────────────────────────────────────────────────────────── */

  function handleBank(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setBankDone(true);
  }

  function handleCryptoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBankDone(true);
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(BITCOIN_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 12px", borderRadius: "8px",
    background: "#1F1F1F", border: "1px solid #2A2A2A",
    color: "#F0EDE8", fontSize: "14px", fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s",
  };

  // ── Bank / Zelle confirmation screen ──────────────────────────────────────
  if (bankDone && method === "bank") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ padding: "16px", background: "rgba(42,122,74,0.08)", border: "1px solid rgba(42,122,74,0.2)", borderRadius: "10px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#5DBF84", marginBottom: "6px" }}>
            Thank you, {name || "friend"}!
          </p>
          <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.7 }}>
            Please send <strong style={{ color: "#C9952A" }}>{formatCurrency(finalAmount)}</strong> using the details below. Then email us at{" "}
            <a href="mailto:donate@globalheartinitiative.org" style={{ color: "#C9952A" }}>donate@globalheartinitiative.org</a>{" "}
            with your name and amount so we can send your receipt.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "Account Name", value: "Eugene Quinn"            },
            { label: "Zelle Email",  value: "genequinn.gq@gmail.com"  },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#161616", border: "1px solid #1F1F1F", borderRadius: "8px" }}
            >
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#4A4540", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              <p style={{ fontSize: "13px", color: "#F0EDE8", fontFamily: "'DM Mono', monospace" }}>{value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setBankDone(false)}
          style={{ fontSize: "12px", color: "#706B63", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Crypto confirmation screen ─────────────────────────────────────────────
  if (bankDone && method === "crypto") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ padding: "16px", background: "rgba(42,122,74,0.08)", border: "1px solid rgba(42,122,74,0.2)", borderRadius: "10px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#5DBF84", marginBottom: "6px" }}>
            Thank you, {name || "friend"}!
          </p>
          <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.7 }}>
            Send any amount of Bitcoin to the address below. After sending, email us at{" "}
            <a href="mailto:donate@globalheartinitiative.org" style={{ color: "#C9952A" }}>donate@globalheartinitiative.org</a>{" "}
            with your transaction ID so we can confirm and send your receipt.
          </p>
        </div>

        {/* Bitcoin address card */}
        <div style={{ padding: "20px", background: "#161616", border: "1px solid #1F1F1F", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=040" alt="Bitcoin" style={{ width: 28, height: 28 }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#F0EDE8" }}>Bitcoin (BTC)</p>
          </div>

          <div style={{ width: "100%", padding: "12px 14px", background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <p style={{ fontSize: "11px", color: "#F7931A", fontFamily: "'DM Mono', monospace", wordBreak: "break-all", lineHeight: 1.6 }}>
              {BITCOIN_ADDRESS}
            </p>
            <button
              onClick={handleCopyAddress}
              style={{
                flexShrink: 0, padding: "6px 10px", borderRadius: "6px",
                background: copied ? "rgba(93,191,132,0.1)" : "rgba(247,147,26,0.1)",
                border: `1px solid ${copied ? "rgba(93,191,132,0.3)" : "rgba(247,147,26,0.2)"}`,
                color: copied ? "#5DBF84" : "#F7931A",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                fontSize: "11px", fontWeight: 600, transition: "all 0.2s",
              }}
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <p style={{ fontSize: "11px", color: "#4A4540", textAlign: "center" }}>
            Only send BTC to this address. Sending other assets may result in permanent loss.
          </p>
        </div>

        <button
          onClick={() => setBankDone(false)}
          style={{ fontSize: "12px", color: "#706B63", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={method === "bank" ? handleBank : handleCryptoSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* ── Payment method ── */}
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "10px" }}>
            Payment Method
          </p>

          {/* PayPal option commented out — no API access yet
          <button type="button" onClick={() => setMethod("paypal")} ...>
            🅿 PayPal
          </button>
          */}

          <div className="method-grid">
            {(["bank", "crypto"] as PaymentMethod[]).map((m) => {
              const active = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  style={{
                    padding: "12px 8px", borderRadius: "8px", border: "1px solid",
                    borderColor: active ? "#C9952A" : "#2A2A2A",
                    background:  active ? "rgba(201,149,42,0.08)" : "#1F1F1F",
                    color:       active ? "#C9952A" : "#706B63",
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  }}
                >
                  {m === "bank" ? (
                    <img src="/zelle.svg" alt="Zelle" style={{ width: 28, height: 28, objectFit: "contain" }} />
                  ) : (
                    <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=040" alt="Bitcoin" style={{ width: 28, height: 28, objectFit: "contain" }} />
                  )}
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>
                    {m === "bank" ? "Zelle / Bank" : "Bitcoin"}
                  </span>
                  <span style={{ fontSize: "10px", color: active ? "#C9952A" : "#4A4540" }}>
                    {m === "bank" ? "Instant · No fees" : "Crypto · BTC"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Amount ── */}
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "10px" }}>
            {method === "crypto" ? "Suggested Amount (USD equiv.)" : "Select Amount"}
          </p>
          <div className="preset-grid">
            {presetAmounts.map((preset) => {
              const active = !isCustom && amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(preset); setIsCustom(false); setCustomAmount(""); }}
                  style={{
                    padding: "10px 8px", borderRadius: "8px", border: "1px solid",
                    borderColor: active ? "#C9952A" : "#2A2A2A",
                    background:  active ? "rgba(201,149,42,0.1)" : "#1F1F1F",
                    color:       active ? "#C9952A" : "#B8B3AC",
                    fontSize: "14px", fontWeight: active ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  ${preset}
                </button>
              );
            })}
          </div>
          <div style={{ position: "relative", marginTop: "10px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#706B63", fontSize: "14px" }}>$</span>
            <input
              type="number" min="1" step="1" placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true); setAmount(""); }}
              onFocus={() => setIsCustom(true)}
              style={{ ...field, paddingLeft: "24px", borderColor: isCustom ? "#C9952A" : "#2A2A2A" }}
            />
          </div>
          {finalAmount >= 1 && (
            <p style={{ fontSize: "12px", color: "#706B63", marginTop: "8px", textAlign: "right" }}>
              {method === "crypto" ? "Sending approx. " : isRecurring ? "Monthly giving: " : "One-time: "}
              <span style={{ color: "#C9952A", fontWeight: 600 }}>{formatCurrency(finalAmount)}</span>
            </p>
          )}
        </div>

        {/* ── Campaign selector ── */}
        {campaigns.length > 0 && (
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "8px" }}>
              Direct to Campaign <span style={{ color: "#4A4A44", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} style={{ ...field, cursor: "pointer" }}>
              <option value="">General fund</option>
              {campaigns.filter((c) => c.status === "active" || c.status === "urgent").map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Donor info (hidden for crypto — no email needed to show address) ── */}
        {method !== "crypto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "2px" }}>
              Your Details
            </label>
            <input type="text" placeholder="Full name (optional)" value={name} onChange={(e) => setName(e.target.value)} style={field} />
            <input
              type="email"
              placeholder="Email address * (for your receipt)"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ ...field, borderColor: email && !email.includes("@") ? "rgba(160,65,42,0.6)" : "#2A2A2A" }}
            />
            <p style={{ fontSize: "11px", color: "#706B63" }}>
              We&apos;ll email your receipt once your transfer is confirmed.
            </p>
          </div>
        )}

        {/* ── Crypto: optional contact ── */}
        {method === "crypto" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "2px" }}>
              Contact <span style={{ color: "#4A4A44", textTransform: "none", letterSpacing: 0 }}>(optional — for receipt)</span>
            </label>
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={field} />
            <input
              type="email"
              placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={field}
            />
          </div>
        )}

        {/* ── Newsletter opt-in ── */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
          <div
            onClick={() => setNewsletterOptIn((v) => !v)}
            style={{
              width: 16, height: 16, borderRadius: "4px", flexShrink: 0, marginTop: 1,
              background: newsletterOptIn ? "#C9952A" : "#1F1F1F",
              border: `1px solid ${newsletterOptIn ? "#C9952A" : "#2A2A2A"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {newsletterOptIn && <CheckCircle2 size={11} style={{ color: "#0D0D0D" }} />}
          </div>
          <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.5 }}>
            Keep me updated with news and impact stories from Global Hearts Initiative
          </p>
        </label>

        {/* ── Error ── */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(160,65,42,0.1)", border: "1px solid rgba(160,65,42,0.2)" }}>
            <p style={{ fontSize: "12px", color: "#E07A5A" }}>{error}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!isValid || loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "14px", borderRadius: "10px", border: "none", width: "100%",
            background: !isValid || loading
              ? "rgba(201,149,42,0.4)"
              : method === "crypto" ? "#F7931A" : "#C9952A",
            color: "#0D0D0D", fontSize: "15px", fontWeight: 600,
            cursor: !isValid || loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.15s", letterSpacing: "0.01em",
          }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing…</>
          ) : method === "bank" ? (
            <><Heart size={16} />Show Bank & Zelle Details — {formatCurrency(finalAmount || 0)}</>
          ) : (
            <>
              <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=040" alt="BTC" style={{ width: 16, height: 16 }} />
              Show Bitcoin Address
            </>
          )}
        </button>

        <p style={{ fontSize: "11px", color: "#4A4A44", textAlign: "center", lineHeight: 1.5 }}>
          {method === "bank"
            ? "Bank transfers processed manually · Receipt sent within 24 hours"
            : "Send BTC to our wallet address · Email us your TX ID for a receipt"}
        </p>
      </form>

      <style>{`
        .preset-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .method-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (max-width: 360px) {
          .preset-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}