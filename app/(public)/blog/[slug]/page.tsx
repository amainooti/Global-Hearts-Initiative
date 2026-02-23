import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { RelatedPostCard } from "@/components/public/blog/RelatedPostCard";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase  = await createClient();
  const { data }  = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (!data) return {};
  return {
    title: `${data.title} — Global hearts Initiative`,
    description: data.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, published_at, category")
    .eq("published", true)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <>
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

        {/* Hero */}
        <div className="post-hero">
          {post.cover_image && (
            <>
              <img src={post.cover_image} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0D0D0D 0%, transparent 60%)" }} />
            </>
          )}
          <div className="post-hero-inner" style={{ position: "relative", zIndex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <a href="/blog" style={{ fontSize: "12px", color: "#706B63", textDecoration: "none" }}>Blog</a>
              <span style={{ fontSize: "12px", color: "#4A4540" }}>→</span>
              {post.category && <span style={{ fontSize: "12px", color: "#7A5A1A" }}>{post.category}</span>}
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 600, color: "#F0EDE8",
              lineHeight: 1.1, marginBottom: "20px",
              maxWidth: "800px",
            }}>
              {post.title}
            </h1>

            {post.excerpt && (
              <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#B8B3AC", maxWidth: "620px", lineHeight: 1.7, marginBottom: "24px" }}>
                {post.excerpt}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {post.published_at && (
                <p style={{ fontSize: "12px", color: "#4A4540" }}>{formatDate(post.published_at)}</p>
              )}
              {post.category && (
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: "rgba(201,149,42,0.1)", color: "#C9952A", border: "1px solid rgba(201,149,42,0.2)" }}>
                  {post.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Article body */}
        {post.content && (
          <div className="post-body-wrap">
            <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        )}

        {/* Donate CTA strip */}
        <div className="post-cta-strip">
          <div style={{ maxWidth: "720px" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, color: "#F0EDE8", marginBottom: "10px", lineHeight: 1.2 }}>
              Stories like this are made possible by your generosity.
            </p>
            <p style={{ fontSize: "14px", color: "#706B63", marginBottom: "24px" }}>
              Every donation — no matter the size — reaches someone who needs it.
            </p>
          </div>
          <a
            href="/donate"
            style={{
              display: "inline-block",
              padding: "13px 32px",
              background: "#C9952A", color: "#0D0D0D",
              fontWeight: 700, fontSize: "13px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: "6px",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            Donate Now
          </a>
        </div>

        {/* Related posts */}
        {(related?.length ?? 0) > 0 && (
          <div className="post-related">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "10px" }}>
                Continue Reading
              </p>
              <div className="related-grid">
                {related!.map((r) => (
                  <RelatedPostCard key={r.id} post={r} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Hero */
        .post-hero {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background: #161616;
          border-bottom: 1px solid #1F1F1F;
        }
        .post-hero-inner {
          padding: 72px clamp(24px, 6vw, 80px);
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Body */
        .post-body-wrap {
          max-width: 740px;
          margin: 0 auto;
          padding: 64px clamp(24px, 6vw, 80px) 72px;
        }
        .post-body {
          font-size: 17px;
          color: #B8B3AC;
          line-height: 1.85;
        }
        .post-body h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 32px; font-weight: 600;
          color: #F0EDE8; margin: 40px 0 16px; line-height: 1.2;
        }
        .post-body h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 24px; font-weight: 600;
          color: #F0EDE8; margin: 28px 0 12px;
        }
        .post-body p         { margin: 0 0 20px; }
        .post-body ul,
        .post-body ol        { margin: 0 0 20px; padding-left: 24px; }
        .post-body li        { margin-bottom: 8px; }
        .post-body blockquote {
          border-left: 2px solid #C9952A;
          margin: 32px 0; padding: 10px 0 10px 24px;
          color: #706B63; font-style: italic; font-size: 20px; line-height: 1.6;
        }
        .post-body a         { color: #C9952A; }
        .post-body strong    { color: #F0EDE8; font-weight: 600; }
        .post-body img       { width: 100%; border-radius: 10px; margin: 8px 0 20px; }

        /* Donate CTA strip */
        .post-cta-strip {
          background: #161616;
          border-top: 1px solid #1F1F1F;
          border-bottom: 1px solid #1F1F1F;
          padding: 48px clamp(24px, 6vw, 80px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          max-width: 100%;
        }

        /* Related */
        .post-related {
          padding: 64px clamp(24px, 6vw, 80px) 80px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 24px;
        }

        @media (max-width: 900px) {
          .post-hero    { min-height: 320px; }
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .post-hero-inner  { padding: 48px clamp(20px, 5vw, 48px); }
          .post-body-wrap   { padding: 48px clamp(20px, 5vw, 48px) 56px; }
          .post-body        { font-size: 16px; }
          .post-cta-strip   { padding: 40px clamp(20px, 5vw, 48px); }
          .post-related     { padding: 48px clamp(20px, 5vw, 48px) 64px; }
        }
        @media (max-width: 600px) {
          .related-grid { grid-template-columns: 1fr; gap: 28px; }
          .post-cta-strip { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .post-hero        { min-height: 260px; }
          .post-hero-inner  { padding: 40px 20px; }
          .post-body-wrap   { padding: 36px 20px 48px; }
          .post-related     { padding: 40px 20px 56px; }
        }
      `}</style>
    </>
  );
}