/** @type {import('next').NextConfig} */
// Mirrors PolicyEngine/uk-autumn-budget-dashboard-2026 next.config.ts, plus a
// static export so the demo can be served from out/. Served from the root by
// default; set NEXT_PUBLIC_BASE_PATH to mount under a policyengine.org path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: "export",
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  // recharts ships CJS interop and relies on browser globals; transpiling it
  // through Next's pipeline avoids ESM/CJS mismatch errors during build.
  transpilePackages: ["recharts"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
