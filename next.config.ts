import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  // Keep native/WASM image deps as plain runtime requires instead of bundling.
  // Without this, webpack walks libheif-js's WASM bundle, which (a) emits
  // "Critical dependency: require function..." warnings, and (b) inflates
  // build memory enough to OOM-kill the Next build worker on small droplets.
  serverExternalPackages: [
    "sharp",
    "heic-convert",
    "heic-decode",
    "libheif-js",
  ],
  experimental: {
    serverActions: {
      // Default is 1 MB; car forms upload multiple images (10 MB each per
      // lib/upload.ts). Sized to fit ~20-30 phone photos per submit. Must be
      // <= nginx `client_max_body_size` (currently 300m in sites-available)
      // and <= middlewareClientMaxBodySize below.
      bodySizeLimit: "300mb",
    },
    // `/admin/:path*` is matched by middleware.ts for auth, which makes Next
    // buffer the request body in memory (default cap: 10 MB) so it can be read
    // both in middleware and the action. Multipart car uploads exceed that and
    // get truncated mid-boundary, surfacing as `Unexpected end of form` /
    // "Failed to find Server Action". Match the server action limit so the
    // entire multipart body is preserved end-to-end.
    middlewareClientMaxBodySize: "300mb",
  },
};

export default nextConfig;
