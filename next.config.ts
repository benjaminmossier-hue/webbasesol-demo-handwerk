import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statische Seiten erzeugen (Ordner "out"), damit Cloudflare Pages sie kostenlos ausliefern kann
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
