/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/okyi",
  assetPrefix: "/okyi/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
