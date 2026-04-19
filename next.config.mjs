/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid intermittent Windows lock issues on `.next/trace`.
  distDir: ".next-app",
};

export default nextConfig;
