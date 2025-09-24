const allowedOrigins = new Set(
  (process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (process.env.NODE_ENV !== "production") {
  // Allow the local dev host even when requests are forwarded by a tunnel/proxy.
  allowedOrigins.add("localhost:3000");
  allowedOrigins.add("127.0.0.1:3000");
}

const serverActions = {
  // naikin limit biar upload file via Server Actions nggak 1MB lagi
  bodySizeLimit: "8mb",
};

if (allowedOrigins.size > 0) {
  // kalau kamu pakai proxy/domain lain, tambahkan di env NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS
  serverActions.allowedOrigins = Array.from(allowedOrigins);
}

module.exports = {
  experimental: {
    serverActions,
    // Kalau perlu, tetap declare ini supaya Turbopack tahu dependency server
  },
};
