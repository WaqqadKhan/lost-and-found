/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the default `.next` output directory. A custom `distDir` was causing
  // frequent Windows `UNKNOWN` / `EPERM` failures while writing build manifests,
  // which surfaces as broken dev servers and Internal Server Errors.
};

export default nextConfig;
