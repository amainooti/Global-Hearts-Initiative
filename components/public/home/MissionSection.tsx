"use client";

import type { SiteSettings } from "@/lib/types/app";

export default function MissionSection({ settings }: { settings: SiteSettings }) {
  const heading  = settings.home_cta_heading      || "A Foundation Built on Trust";
  const body     = settings.home_cta_body         || "For over two decades, Hearts Initiative has channelled your generosity to communities in crisis — from emergency relief to long-term development. Every dollar is tracked. Every programme is evaluated. We believe accountability is an act of faith.";
  const image    = settings.home_cta_image;
  const btnLabel = settings.home_cta_button_label || "Donate Now";
  const btnHref  = settings.home_cta_button_href  || "/donate";

  return (
    <>
      <section style={{ background: "#161616", borderTop: "1px solid #1F1F1F", borderBottom: "1px solid #1F1F1F" }}>
        <div className="mission-inner">
          {/* Text */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "16px" }}>
              Our Mission
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 600, color: "#F0EDE8",
              lineHeight: 1.1, marginBottom: "24px",
            }}>
              {heading}
            </h2>
            <p style={{ fontSize: "16px", color: "#B8B3AC", lineHeight: 1.8, marginBottom: "32px", whiteSpace: "pre-line" }}>
              {body}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
              {[
                { icon: "◎", label: "Shariah-compliant distribution" },
                { icon: "◈", label: "Independent financial audits" },
                { icon: "◇", label: "On-the-ground accountability" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: "#7A5A1A", fontSize: "14px" }}>{icon}</span>
                  <span style={{ fontSize: "14px", color: "#B8B3AC" }}>{label}</span>
                </div>
              ))}
            </div>
            <a
              href={btnHref}
              style={{
                display: "inline-block", padding: "12px 28px",
                background: "#C9952A", color: "#0D0D0D",
                fontWeight: 700, fontSize: "13px",
                letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "none", borderRadius: "6px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E0A830")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C9952A")}
            >
              {btnLabel}
            </a>
          </div>

          {/* Image */}
          {image && (
            <div style={{ position: "relative" }}>
              <img
                src={image}
                alt="Mission"
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "12px", display: "block" }}
              />
              <div className="mission-img-accent" />
            </div>
          )}
        </div>
      </section>

      <style>{`
        .mission-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 96px clamp(24px, 6vw, 80px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .mission-img-accent {
          position: absolute;
          bottom: -16px; right: -16px;
          width: 60%; height: 60%;
          border: 1px solid rgba(201,149,42,0.2);
          border-radius: 12px;
          pointer-events: none;
        }
        @media (max-width: 900px) {
          .mission-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 64px clamp(24px, 6vw, 80px);
          }
          .mission-img-accent { display: none; }
        }
        @media (max-width: 480px) {
          .mission-inner { padding: 48px 24px; }
        }
      `}</style>
    </>
  );
}