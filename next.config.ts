import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
