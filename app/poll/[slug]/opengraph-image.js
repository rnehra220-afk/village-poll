import { ImageResponse } from "next/og";
import { getAnonClient } from "../../../lib/supabase";
import { cleanText } from "../../../lib/validate";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic social preview image for each poll:
 * village name + poll type on neutral branded background.
 * Never shows a candidate as winner.
 */
export default async function OgImage({ params }) {
  let village = "Village Poll";
  let sub = "Unofficial Opinion Poll";

  try {
    const db = getAnonClient();
    const { data } = await db
      .from("polls")
      .select("village_name, district, state, poll_type")
      .eq("slug", cleanText(params.slug, 120))
      .in("status", ["active", "closed"])
      .single();
    if (data) {
      village = data.village_name;
      sub = `${data.poll_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Opinion Poll · ${data.district}, ${data.state}`;
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#1e40af",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85, letterSpacing: 4, textTransform: "uppercase" }}>
          Unofficial Opinion Poll
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, marginTop: 16, lineHeight: 1.1 }}>{village}</div>
        <div style={{ fontSize: 34, marginTop: 16, opacity: 0.9 }}>{sub}</div>
        <div style={{ fontSize: 24, marginTop: 32, opacity: 0.75 }}>Not an official election vote</div>
      </div>
    ),
    { ...size }
  );
}
