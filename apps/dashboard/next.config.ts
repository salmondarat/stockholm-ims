import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // naikin limit biar upload file via Server Actions nggak 1MB lagi
      bodySizeLimit: "8mb",
      // kalau kamu pakai proxy/domain lain, tambahkan di sini
      // allowedOrigins: ["my-proxy.example.com", "*.my-proxy.example.com"],
    },
    // Kalau perlu, tetap declare ini supaya Turbopack tahu dependency server
  },
};

export default nextConfig;
