import type { NextConfig } from "next";

const CURRENT_HOST = "chongqing-plan.vercel.app";
const RETIRED_HOSTS = ["chongqing-gift-planner.vercel.app"];

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    // The project was renamed, and the old address still resolves to this
    // deployment. Send anyone who kept the old link to the current one,
    // keeping their path and query.
    return RETIRED_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CURRENT_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
