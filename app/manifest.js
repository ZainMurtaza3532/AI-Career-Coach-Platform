export default function manifest() {
  return {
    name: "Sensai - AI Career Coach Platform",
    short_name: "Sensai",
    description:
      "AI-powered career coaching, ATS resume building, and technical interview preparation platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#020817",
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
