import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['three'],
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
    }];
  },
};

export default config;
