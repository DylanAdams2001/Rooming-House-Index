/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Property-manager-uploaded listing photos are served from Supabase
    // Storage's public URLs — next/image refuses remote hosts by default.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        // /find-a-room duplicated the homepage almost exactly — merged the
        // "how it works" section into / and pointed this at it instead of
        // maintaining two near-identical pages.
        source: "/find-a-room",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
