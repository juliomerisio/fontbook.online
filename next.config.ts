import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  reactStrictMode: true,
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWAConfig(config);
