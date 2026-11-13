/** @type {import('next').NextConfig} */
module.exports = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/shot": ["./node_modules/@sparticuz/chromium/bin/**", "./fonts/**"],
  },
};
