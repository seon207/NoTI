import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack(origConfig, { isServer }) {
    if (!isServer) {
      // origConfig를 직접 변경하지 않고, 새로운 객체로 빌드 설정을 반환
      return {
        ...origConfig,
        resolve: {
          ...origConfig.resolve,
          fallback: {
            // 기존 fallback이 있으면 그대로 복사해오고, fs만 false로 설정
            ...(origConfig.resolve?.fallback ?? {}),
            fs: false,
          },
        },
      };
    }
    return origConfig;
  },
};

export default nextConfig;
