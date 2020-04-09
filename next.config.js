const withImages = require("next-images");

module.exports = withImages({
  experimental: {
    modern: true,
    async rewrites() {
      return [
        { source: "/sitemap.xml", destination: "/api/sitemap" },
        { source: "/robots.txt", destination: "/api/robots" }
      ];
    },
    catchAllRouting: true
  }
});
