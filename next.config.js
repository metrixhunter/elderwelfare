module.exports = {
  images: {
    unoptimized: true // ✅ Keeps the image optimization setting
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5000/api/auth/:path*',
      },
    ];
  },
};

