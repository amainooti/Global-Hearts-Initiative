"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

const CURRENCIES = ["USD", "NGN", "GBP", "EUR", "CAD", "AUD"];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4A4540",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "8px",
  background: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F0EDE8",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

export default function CreateReceiptModal({ onClose }: Props) {
  const [form, setForm] = useState({
    donorName:     "",
    donorEmail:    "",
    amount:        "",
    currency:      "USD",
    txHash:        "",
    campaignTitle: "",
    campaignSlug:  "",
    isRecurring:   false,
  });
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState<{ ok: boolean; msg: string } | null>(null);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.donorEmail || !form.amount || !form.txHash) {
      setResult({ ok: false, msg: "Email, amount, and reference are required." });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/donations/create-receipt", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName:     form.donorName     || null,
          donorEmail:    form.donorEmail,
          amount:        parseFloat(form.amount),
          currency:      form.currency,
          txHash:        form.txHash,
          campaignTitle: form.campaignTitle || null,
          campaignSlug:  form.campaignSlug  || null,
          isRecurring:   form.isRecurring,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: `Receipt sent to ${form.donorEmail} ✓` });
        setForm({
          donorName: "", donorEmail: "", amount: "", currency: "USD",
          txHash: "", campaignTitle: "", campaignSlug: "", isRecurring: false,
        });
      } else {
        setResult({ ok: false, msg: data.error ?? "Failed to send receipt." });
      }
    } catch {
      setResult({ ok: false, msg: "Network error." });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 50, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 51, width: "100%", maxWidth: "480px",
          background: "#161616", border: "1px solid #2A2A2A",
          borderRadius: "14px", padding: "32px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9952A", marginBottom: "4px" }}>
              Manual Receipt
            </p>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#F0EDE8" }}>
              Create Donation Receipt
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#706B63",
              fontSize: "20px", cursor: "pointer", lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Row: name + email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Donor Name">
              <input
                style={inputStyle}
                placeholder="Amina Hassan"
                value={form.donorName}
                onChange={(e) => set("donorName", e.target.value)}
              />
            </Field>
            <Field label="Donor Email *">
              <input
                style={inputStyle}
                type="email"
                placeholder="donor@email.com"
                value={form.donorEmail}
                onChange={(e) => set("donorEmail", e.target.value)}
              />
            </Field>
          </div>

          {/* Row: amount + currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "12px" }}>
            <Field label="Amount *">
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="50.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </Field>
            <Field label="Currency">
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Transaction reference */}
          <Field label="Transaction Reference *">
            <input
              style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
              placeholder="PSK_xxxxxxxxxxxxx"
              value={form.txHash}
              onChange={(e) => set("txHash", e.target.value)}
            />
          </Field>

          {/* Campaign (optional) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Campaign Title (optional)">
              <input
                style={inputStyle}
                placeholder="Gaza Relief Fund"
                value={form.campaignTitle}
                onChange={(e) => set("campaignTitle", e.target.value)}
              />
            </Field>
            <Field label="Campaign Slug (optional)">
              <input
                style={inputStyle}
                placeholder="gaza-relief-fund"
                value={form.campaignSlug}
                onChange={(e) => set("campaignSlug", e.target.value)}
              />
            </Field>
          </div>

          {/* Recurring toggle */}
          <label
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              cursor: "pointer", userSelect: "none",
            }}
          >
            <div
              onClick={() => set("isRecurring", !form.isRecurring)}
              style={{
                width: "36px", height: "20px", borderRadius: "10px",
                background: form.isRecurring ? "#C9952A" : "#2A2A2A",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute", top: "2px",
                  left: form.isRecurring ? "18px" : "2px",
                  width: "16px", height: "16px",
                  borderRadius: "50%", background: "#F0EDE8",
                  transition: "left 0.2s",
                }}
              />
            </div>
            <span style={{ fontSize: "13px", color: "#B8B3AC" }}>Monthly recurring donation</span>
          </label>

          {/* Result message */}
          {result && (
            <p style={{
              fontSize: "12px", fontWeight: 600,
              color: result.ok ? "#5DBF84" : "#E07A5A",
              padding: "10px 12px",
              background: result.ok ? "rgba(93,191,132,0.08)" : "rgba(224,122,90,0.08)",
              borderRadius: "6px", margin: 0,
            }}>
              {result.msg}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "10px",
                background: "transparent", border: "1px solid #2A2A2A",
                borderRadius: "8px", color: "#706B63",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={sending}
              style={{
                flex: 2, padding: "10px",
                background: sending ? "rgba(201,149,42,0.4)" : "#C9952A",
                border: "none", borderRadius: "8px",
                color: "#0D0D0D", fontSize: "13px", fontWeight: 700,
                cursor: sending ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "background 0.15s",
              }}
            >
              {sending ? "Sending…" : "Send Receipt"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}