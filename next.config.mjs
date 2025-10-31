/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino-pretty"],
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
