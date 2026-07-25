/** @type {import('next').NextConfig} */
const nextConfig = {
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
