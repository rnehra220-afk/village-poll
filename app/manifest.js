export default function manifest() {
  return {
    name: "Village Poll — Unofficial Village Opinion Polls",
    short_name: "Village Poll",
    description:
      "Create and share unofficial public opinion polls for Sarpanch, Ward Panch and Zila Parishad positions.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
