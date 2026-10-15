export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://sensai-career.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/onboarding/",
          "/resume/",
          "/interview/",
          "/ai-cover-letter/",
          "/ai-networking/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
