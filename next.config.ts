import type { NextConfig } from 'next'

module.exports = {
  async redirects() {
    return [
      {
        source: '/work',
        destination: '/',
        permanent: true,
      },
      {
        source: '/work/:slug',
        destination: '/:slug', // Matched parameters can be used in the destination
        permanent: true,
      },
    ]
  },
}

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
