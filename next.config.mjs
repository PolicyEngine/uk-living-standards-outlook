/** @type {import('next').NextConfig} */
// Local demo: served from the root by default. Set NEXT_PUBLIC_BASE_PATH to
// mount under a policyengine.org path (as the source dashboards do).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: "export",
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  // Pin Turbopack to the project root so it does not pick up a stray lockfile
  // from a parent directory.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
