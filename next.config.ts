import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16+: hide the on-screen dev indicator (the small "N" button) entirely.
  // Note: older `devIndicators.buildActivity` options were removed in v16.
  devIndicators: false,
};

export default nextConfig;
