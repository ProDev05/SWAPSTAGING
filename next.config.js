/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "ipfs.moralis.io",
      'images.unsplash.com',
      'swap.yourlifegames.com'
    ],
  }
};

module.exports = {
  ...nextConfig,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        and: [/\.(js|ts)x?$/]
      },
      use: ['@svgr/webpack']
    })

    config.resolve.alias['@'] = path.join(__dirname, '/');

    return config;
  }
}
