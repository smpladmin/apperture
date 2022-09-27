/** @type {import('next').NextConfig} */
console.log(
  process.env.BACKEND_BASE_URL,
  process.env.PUBLIC_BACKEND_BASE_URL,
  process.env.PUBLIC_FRONTEND_BASE_URL,
  process.env.PUBLIC_AMPLITUDE_API_KEY
);
const nextConfig = {
  swcMinify: true,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  serverRuntimeConfig: {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  publicRuntimeConfig: {
    PUBLIC_BACKEND_BASE_URL: process.env.PUBLIC_BACKEND_BASE_URL,
    PUBLIC_FRONTEND_BASE_URL: process.env.PUBLIC_FRONTEND_BASE_URL,
    PUBLIC_AMPLITUDE_API_KEY: process.env.PUBLIC_AMPLITUDE_API_KEY,
  },
};

module.exports = nextConfig;
