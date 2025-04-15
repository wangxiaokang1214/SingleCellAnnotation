/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/gene-classification-system',
  assetPrefix: '/gene-classification-system/',
}

module.exports = nextConfig 