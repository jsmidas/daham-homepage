/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // NextAuth v5 beta 타입 이슈로 빌드 시 타입체크 건너뜀
    // 개발 시에는 IDE에서 타입 체크 가능
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
