/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Suppress OpenTelemetry warnings for optional dependencies
      config.ignoreWarnings = [
        { module: /node_modules\/@opentelemetry/ },
      ];
    }
    return config;
  },
}

module.exports = nextConfig
