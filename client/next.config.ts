import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mysten/walrus", "@mysten/walrus-wasm"],
  images: {
    localPatterns: [
      {
        pathname: "/api/walrus-image"
      }
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**"
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**"
      }
    ]
  }
};

export default nextConfig;
