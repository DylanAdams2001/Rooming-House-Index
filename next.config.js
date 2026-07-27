/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next's client-side Router Cache normally reuses a dynamic page's last
    // render for 30s, even across a real navigation (e.g. Back to the
    // Messages inbox after reading a conversation) — so unread dots/bold
    // text kept showing stale state until a hard refresh. Every page here
    // is auth-gated and per-user, so there's no benefit to caching it
    // client-side at all.
    staleTimes: {
      dynamic: 0,
    },
  },
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
