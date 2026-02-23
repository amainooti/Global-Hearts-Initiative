
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import CampaignGrid from "@/components/public/campaigns/CampaignGrid";
import type { Campaign } from "@/lib/types/app";

export const metadata = { title: "Campaigns — Global hearts Initiative" };
export const revalidate = 3600;

export default async function CampaignsPage() {
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, slug, description, cover_image, status, target_amount, raised_amount, donor_count, is_featured, category, tags")
    .in("status", ["active", "urgent"])
    .order("is_featured", { ascending: false })
    .order("created_at",  { ascending: false });

  return (
    <>
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
        {/* Hero */}
        <div className="campaigns-hero">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "12px" }}>
              Active Campaigns
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 600, color: "#F0EDE8",
              lineHeight: 1.1, marginBottom: "14px",
            }}>
              {settings.home_campaigns_heading || "Our Campaigns"}
            </h1>
            {settings.home_campaigns_subheading && (
              <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#706B63", maxWidth: "520px", lineHeight: 1.7 }}>
                {settings.home_campaigns_subheading}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="campaigns-body">
          <CampaignGrid campaigns={(campaigns ?? []) as Campaign[]} />
        </div>
      </div>

      <style>{`
        .campaigns-hero {
          background: linear-gradient(to bottom, #161616, #0D0D0D);
          border-bottom: 1px solid #1F1F1F;
          padding: 72px clamp(24px, 6vw, 80px) 56px;
        }
        .campaigns-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px clamp(24px, 6vw, 80px) 80px;
        }
        @media (max-width: 768px) {
          .campaigns-hero { padding: 48px clamp(20px, 5vw, 48px) 40px; }
          .campaigns-body { padding: 40px clamp(20px, 5vw, 48px) 64px; }
        }
        @media (max-width: 480px) {
          .campaigns-hero { padding: 40px 20px 32px; }
          .campaigns-body { padding: 32px 20px 48px; }
        }
      `}</style>
    </>
  );
}