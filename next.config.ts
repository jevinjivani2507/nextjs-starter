import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    appDir: true,
    esmExternals: "loose",
    serverComponentsExternalPackages: ["mongoose"],
  },
};

export default nextConfig;
