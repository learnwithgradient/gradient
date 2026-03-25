/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set NEXT_PUBLIC_BASE_PATH=/gradient for GitHub Pages deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Set NEXT_STATIC_EXPORT=true for GitHub Pages static export
  ...(process.env.NEXT_STATIC_EXPORT === "true" && {
    output: "export",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
