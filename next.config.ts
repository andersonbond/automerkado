import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  experimental: {
    serverActions: {
      // Default is 1 MB; car forms upload multiple images (10 MB each per lib/upload.ts).
      // Sized to fit ~10 photos per submit; nginx `client_max_body_size` must be >= this.
      bodySizeLimit: "120mb",
    },
  },
};

export default nextConfig;
