declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAConfig = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
  };

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
}
