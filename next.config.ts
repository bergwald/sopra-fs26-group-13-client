import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Keep dev artifacts separate from production build artifacts.
  // This avoids collisions if `next dev` and `next build` run in parallel.
  distDir: isDevelopment ? ".next-dev" : ".next",
};

export default nextConfig;
