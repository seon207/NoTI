import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    // 프로덕션 빌드 시 ESLint 오류가 있으면 빌드 실패하도록 설정
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
