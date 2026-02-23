import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import DonationForm from "@/components/public/DonationForm";
import type { Campaign } from "@/lib/types/app";

export const metadata = {
  title: "Donate — Zakat Foundation of America",
  description: "Your generosity changes lives. Donate to Zakat Foundation of America.",
};

export default async function DonatePage() {
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, slug, status")
    .in("status", ["active", "urgent"])
    .order("is_featured", { ascending: false });

  const presetAmounts: number[] = settings.donate_preset_amounts
    ? JSON.parse(settings.donate_preset_amounts)
    : [250, 500, 1000];

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>

        {/* Hero */}
        <div className="donate-hero">
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "14px" }}>
            Make a Difference
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 54px)",
            fontWeight: 600, color: "#F0EDE8",
            lineHeight: 1.15, marginBottom: "16px",
          }}>
            {settings.donate_heading || "Your Generosity Saves Lives"}
          </h1>
          {settings.donate_intro && (
            <p style={{ fontSize: "16px", color: "#706B63", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              {settings.donate_intro}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="donate-body">

          {/* Left — context */}
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 600,
              color: "#F0EDE8", marginBottom: "20px", lineHeight: 1.2,
            }}>
              Where Your Donation Goes
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { pct: "82%", label: "Direct programme delivery", desc: "Food, medical care, shelter, education — reaching families in need." },
                { pct: "10%", label: "Fundraising & operations",  desc: "Ensuring your donation reaches its destination efficiently." },
                { pct: "8%",  label: "Administration",            desc: "Governance, compliance, and accountability." },
              ].map(({ pct, label, desc }) => (
                <div key={label} style={{ display: "flex", gap: "16px", padding: "16px 18px", borderRadius: "10px", background: "#161616", border: "1px solid #1F1F1F" }}>
                  <p style={{ fontSize: "22px", fontWeight: 700, color: "#C9952A", fontFamily: "'DM Mono', monospace", flexShrink: 0, minWidth: "52px" }}>
                    {pct}
                  </p>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "4px" }}>{label}</p>
                    <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Active campaigns */}
            {(campaigns?.length ?? 0) > 0 && (
              <div style={{ marginTop: "36px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "14px" }}>
                  Active Campaigns
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {campaigns!.map((c) => (
                    <a
                      key={c.id}
                      href={`/campaigns/${c.slug}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px", borderRadius: "8px",
                        background: "#161616", border: "1px solid #1F1F1F",
                        textDecoration: "none",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: "#B8B3AC" }}>{c.title}</p>
                      {c.status === "urgent" && (
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(160,65,42,0.12)", color: "#E07A5A", flexShrink: 0 }}>
                          Urgent
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — form */}
          <div className="donate-form-col">
            <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "16px", padding: "28px" }}>
              <DonationForm
                campaigns={(campaigns ?? []) as Campaign[]}
                presetAmounts={presetAmounts}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .donate-hero {
          background: linear-gradient(to bottom, #161616, #0D0D0D);
          border-bottom: 1px solid #1F1F1F;
          padding: 80px clamp(24px, 6vw, 80px) 60px;
          text-align: center;
        }
        .donate-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px clamp(24px, 6vw, 80px) 80px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 60px;
          align-items: start;
        }
        .donate-form-col {
          position: sticky;
          top: 88px;
        }
        @media (max-width: 900px) {
          .donate-body {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 48px clamp(20px, 5vw, 48px) 64px;
          }
          /* Form moves above the context on mobile — swap order */
          .donate-form-col {
            order: -1;
            position: static;
          }
        }
        @media (max-width: 480px) {
          .donate-hero { padding: 60px 20px 48px; }
          .donate-body { padding: 36px 20px 56px; gap: 36px; }
        }
      `}</style>
    </>
  );
}