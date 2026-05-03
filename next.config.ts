import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  experimental: {
    serverActions: {
      // Default is 1 MB; car forms upload multiple images (5 MB each per lib/upload.ts).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
