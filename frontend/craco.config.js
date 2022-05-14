const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      stats: 'errors-only',
      resolve: {
        fallback: {
          fs: false,
          stream: require.resolve('stream-browserify'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
          http: require.resolve('stream-http'),
          buffer: require.resolve('buffer/'),
          util: require.resolve('util/'),
          assert: require.resolve('assert/'),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};
