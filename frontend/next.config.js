/** @type {import('next').NextConfig} */

const nextConfig = {
  swcMinify: true,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
