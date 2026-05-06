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
    // `/admin/:path*` is matched by middleware.ts for auth, which makes Next
    // buffer the request body in memory (default cap: 10 MB) so it can be read
    // both in middleware and the action. Multipart car uploads exceed that and
    // get truncated mid-boundary, surfacing as `Unexpected end of form` /
    // "Failed to find Server Action". Match the server action limit so the
    // entire multipart body is preserved end-to-end.
    middlewareClientMaxBodySize: "120mb",
  },
};

export default nextConfig;
