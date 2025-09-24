/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',   // REMOVE or COMMENT OUT this line!
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  typescript:{
    ignoreBuildErrors:true
  }
};

export default nextConfig;
