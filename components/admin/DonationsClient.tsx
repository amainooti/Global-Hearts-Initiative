"use client";

import { useState } from "react";
import CreateReceiptModal from "@/components/admin/CreateReceiptModal";

interface Donation {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  is_recurring: boolean;
  status: string;
  paystack_ref: string;
  receipt_sent: boolean;
  campaign_id: string | null;
  created_at: string;
}

interface Props {
  donations: Donation[];
  totalRaised: number;
  recurringCount: number;
  totalCount: number;
}

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    completed: { color: "#5DBF84", bg: "rgba(42,122,74,0.12)" },
    pending:   { color: "#C9952A", bg: "rgba(201,149,42,0.10)" },
    failed:    { color: "#E07A5A", bg: "rgba(160,65,42,0.12)" },
  };
  const s = map[status] ?? { color: "#706B63", bg: "rgba(112,107,99,0.1)" };
  return (
    <span
      style={{
        fontSize: "10px", fontWeight: 600, padding: "2px 8px",
        borderRadius: 99, background: s.bg, color: s.color,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

export default function DonationsClient({
  donations,
  totalRaised,
  recurringCount,
  totalCount,
}: Props) {
  const [search,       setSearch]   = useState("");
  const [statusFilter, setStatus]   = useState<"all" | "completed" | "pending" | "failed">("all");
  const [typeFilter,   setType]     = useState<"all" | "one-time" | "recurring">("all");
  const [resending,    setResending] = useState<string | null>(null);
  const [resendMsg,    setResendMsg] = useState<Record<string, string>>({});
  const [showModal,    setShowModal] = useState(false);

  const filtered = donations.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      d.donor_email?.toLowerCase().includes(q) ||
      d.donor_name?.toLowerCase().includes(q) ||
      d.paystack_ref?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "recurring" && d.is_recurring) ||
      (typeFilter === "one-time" && !d.is_recurring);
    return matchSearch && matchStatus && matchType;
  });

  const handleResend = async (donation: Donation) => {
    setResending(donation.id);
    try {
      const res = await fetch("/api/donations/resend-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId: donation.id }),
      });
      const data = await res.json();
      setResendMsg((prev) => ({
        ...prev,
        [donation.id]: res.ok ? "Sent ✓" : (data.error ?? "Failed"),
      }));
    } catch {
      setResendMsg((prev) => ({ ...prev, [donation.id]: "Error" }));
    } finally {
      setResending(null);
      setTimeout(
        () =>
          setResendMsg((prev) => {
            const n = { ...prev };
            delete n[donation.id];
            return n;
          }),
        3000
      );
    }
  };

  const filterPill = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "6px",
        border: `1px solid ${active ? "#C9952A" : "#2A2A2A"}`,
        background: active ? "rgba(201,149,42,0.08)" : "transparent",
        color: active ? "#C9952A" : "#706B63",
        fontSize: "12px", fontWeight: 600, cursor: "pointer",
        letterSpacing: "0.04em", transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: "24px 32px" }}>

      {/* Stats */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px", marginBottom: "28px", maxWidth: "800px",
        }}
      >
        {[
          { label: "Total Donations", value: totalCount.toLocaleString() },
          { label: "Total Raised",    value: formatCurrency(totalRaised) },
          { label: "Completed",       value: donations.filter((d) => d.status === "completed").length.toLocaleString() },
          { label: "Recurring",       value: recurringCount.toLocaleString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              padding: "16px 20px", background: "#161616",
              border: "1px solid #1F1F1F", borderRadius: "10px",
            }}
          >
            <p
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: "20px",
                fontWeight: 500, color: "#C9952A", marginBottom: "4px",
              }}
            >
              {value}
            </p>
            <p
              style={{
                fontSize: "11px", color: "#4A4540", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex", gap: "12px", marginBottom: "16px",
          flexWrap: "wrap", alignItems: "center",
        }}
      >
        <input
          type="search"
          placeholder="Search email, name, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            background: "#0D0D0D", border: "1px solid #2A2A2A",
            color: "#F0EDE8", fontSize: "13px", outline: "none",
            width: "260px", fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {filterPill("All",       statusFilter === "all",       () => setStatus("all"))}
          {filterPill("Completed", statusFilter === "completed", () => setStatus("completed"))}
          {filterPill("Pending",   statusFilter === "pending",   () => setStatus("pending"))}
          {filterPill("Failed",    statusFilter === "failed",    () => setStatus("failed"))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {filterPill("One-time",  typeFilter === "one-time",  () => setType("one-time"))}
          {filterPill("Recurring", typeFilter === "recurring", () => setType("recurring"))}
        </div>

        {/* ── Create Receipt button ── */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            marginLeft: "auto",
            padding: "7px 16px", borderRadius: "8px",
            background: "#C9952A", border: "none",
            color: "#0D0D0D", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "0.04em", transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          + Create Receipt
        </button>

        <p style={{ fontSize: "12px", color: "#4A4540" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#161616", border: "1px solid #1F1F1F",
          borderRadius: "12px", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 100px 100px 90px 80px 100px",
            padding: "10px 20px", borderBottom: "1px solid #1F1F1F",
          }}
        >
          {["Donor", "Reference", "Amount", "Date", "Type", "Status", "Receipt"].map((h) => (
            <p
              key={h}
              style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#4A4540",
              }}
            >
              {h}
            </p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#4A4540" }}>No donations found.</p>
          </div>
        ) : (
          <div style={{ maxHeight: "580px", overflowY: "auto" }}>
            {filtered.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 100px 100px 90px 80px 100px",
                  padding: "12px 20px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid #1A1A1A" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Donor */}
                <div>
                  <p style={{ fontSize: "13px", color: "#F0EDE8" }}>{d.donor_name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#706B63" }}>{d.donor_email || "—"}</p>
                </div>

                {/* Reference */}
                <p
                  style={{
                    fontSize: "11px", color: "#4A4540",
                    fontFamily: "'DM Mono', monospace",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {d.paystack_ref}
                </p>

                {/* Amount */}
                <p
                  style={{
                    fontSize: "13px", fontWeight: 600, color: "#C9952A",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {formatCurrency(d.amount, d.currency)}
                </p>

                {/* Date */}
                <p style={{ fontSize: "12px", color: "#706B63" }}>
                  {formatDate(d.created_at)}
                </p>

                {/* Type */}
                <span
                  style={{
                    fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: 99, width: "fit-content",
                    background: d.is_recurring
                      ? "rgba(201,149,42,0.1)"
                      : "rgba(112,107,99,0.08)",
                    color: d.is_recurring ? "#C9952A" : "#706B63",
                  }}
                >
                  {d.is_recurring ? "Monthly" : "One-time"}
                </span>

                {/* Status */}
                <StatusBadge status={d.status} />

                {/* Receipt */}
                <div>
                  {d.donor_email ? (
                    <button
                      onClick={() => handleResend(d)}
                      disabled={resending === d.id}
                      style={{
                        fontSize: "11px", fontWeight: 600,
                        color: resendMsg[d.id]
                          ? resendMsg[d.id].includes("✓") ? "#5DBF84" : "#E07A5A"
                          : "#C9952A",
                        background: "none", border: "none",
                        cursor: resending === d.id ? "not-allowed" : "pointer",
                        padding: 0, fontFamily: "inherit",
                        opacity: resending === d.id ? 0.5 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      {resendMsg[d.id] ?? (d.receipt_sent ? "Resend" : "Send")}
                    </button>
                  ) : (
                    <p style={{ fontSize: "11px", color: "#2A2A2A" }}>—</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <CreateReceiptModal onClose={() => setShowModal(false)} />}
    </div>
  );
}