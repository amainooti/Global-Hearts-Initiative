"use client";

import { formatDate } from "@/lib/utils";

type Props = {
  post: {
    id: string;
    title: string;
    slug: string;
    cover_image?: string | null;
    published_at?: string | null;
    category?: string | null;
  };
};

export function RelatedPostCard({ post: r }: Props) {
  return (
    <a
      href={`/blog/${r.slug}`}
      style={{ textDecoration: "none", display: "block", transition: "opacity 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <div style={{ aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "#1F1F1F", marginBottom: "12px" }}>
        {r.cover_image
          ? <img src={r.cover_image} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
        }
      </div>
      {r.category && (
        <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A5A1A", marginBottom: "6px" }}>
          {r.category}
        </p>
      )}
      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.25, marginBottom: "6px" }}>
        {r.title}
      </h3>
      {r.published_at && (
        <p style={{ fontSize: "11px", color: "#4A4540" }}>{formatDate(r.published_at)}</p>
      )}
    </a>
  );
}