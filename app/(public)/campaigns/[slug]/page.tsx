import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DonationForm from "@/components/public/DonationForm";
import CampaignProgress from "@/components/public/campaigns/CampaignProgress";
import type { Campaign } from "@/lib/types/app";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase  = await createClient();
  const { data }  = await supabase.from("campaigns").select("title, description").eq("slug", slug).single();
  if (!data) return {};
  return {
    title: `${data.title} — Zakat Foundation of America`,
    description: data.description?.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .neq("status", "archived")
    .single();

  if (!campaign) notFound();

  const c = campaign as Campaign;
  const isUrgent = c.status === "urgent";

  return (
    <>
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

        {/* Cover */}
        {c.cover_image && (
          <div style={{ position: "relative", height: "clamp(220px, 40vw, 500px)", overflow: "hidden" }}>
            <img
              src={c.cover_image}
              alt={c.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0D0D0D 0%, transparent 60%)" }} />
          </div>
        )}

        <div className={`campaign-layout ${c.cover_image ? "has-cover" : "no-cover"}`}>
          {/* Left — content */}
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {isUrgent && (
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: "rgba(160,65,42,0.15)", color: "#E07A5A", border: "1px solid rgba(160,65,42,0.3)" }}>
                  Urgent
                </span>
              )}
              {c.category && (
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: "#1F1F1F", color: "#706B63", border: "1px solid #2A2A2A" }}>
                  {c.category}
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 600, color: "#F0EDE8",
              lineHeight: 1.1, marginBottom: "28px",
            }}>
              {c.title}
            </h1>

            <CampaignProgress campaign={c} />

            {c.description && (
              <div
                style={{ marginTop: "40px" }}
                className="campaign-body"
                dangerouslySetInnerHTML={{ __html: c.description }}
              />
            )}
          </div>

          {/* Donate form */}
          <div className="campaign-form-col">
            <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "16px", padding: "28px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#C9952A", marginBottom: "16px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Support This Campaign
              </p>
              <DonationForm
                campaigns={[c]}
                presetAmounts={[250, 500, 1000]}
                defaultCampaignId={c.id}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .campaign-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px clamp(24px, 6vw, 80px) 80px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 60px;
          align-items: start;
        }
        .campaign-layout.has-cover {
          margin-top: -80px;
          position: relative;
          z-index: 1;
        }
        .campaign-form-col {
          position: sticky;
          top: 88px;
        }
        .campaign-body {
          font-size: 16px;
          color: #B8B3AC;
          line-height: 1.8;
        }
        .campaign-body h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 28px; font-weight: 600;
          color: #F0EDE8; margin: 32px 0 16px; line-height: 1.2;
        }
        .campaign-body h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px; font-weight: 600;
          color: #F0EDE8; margin: 24px 0 12px;
        }
        .campaign-body p  { margin: 0 0 16px; }
        .campaign-body ul, .campaign-body ol { margin: 0 0 16px; padding-left: 24px; }
        .campaign-body li { margin-bottom: 6px; }
        .campaign-body blockquote {
          border-left: 2px solid #C9952A;
          margin: 24px 0; padding: 8px 0 8px 20px;
          color: #706B63; font-style: italic;
        }
        .campaign-body a  { color: #C9952A; }
        .campaign-body strong { color: #F0EDE8; font-weight: 600; }

        @media (max-width: 900px) {
          .campaign-layout {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px clamp(20px, 5vw, 48px) 64px;
          }
          .campaign-layout.has-cover { margin-top: -40px; }
          .campaign-form-col { position: static; }
        }
        @media (max-width: 480px) {
          .campaign-layout { padding: 32px 20px 48px; }
          .campaign-layout.has-cover { margin-top: -24px; }
        }
      `}</style>
    </>
  );
}