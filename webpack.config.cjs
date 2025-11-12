/**
 * Webpack configuration for NestJS + Cloudflare Workers
 * 
 * Key strategy:
 * 1. Bundle all required dependencies into ESM format
 * 2. Mark optional packages as external (they'll become require() calls)
 * 3. Polyfill require() in main.ts to handle optional package failures gracefully
 * 4. Output single main.js with ESM syntax for Cloudflare Workers
 */

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // Force ESM output - Cloudflare Workers require ESM
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
    conditionNames: ['node', 'node-addons'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // Mark optional packages as external to keep as require() calls
  // Our polyfill in main.ts will handle these gracefully
  externals: {
    // Optional microservices transports - won't be bundled
    '@grpc/grpc-js': '@grpc/grpc-js',
    '@grpc/proto-loader': '@grpc/proto-loader',
    'kafkajs': 'kafkajs',
    'mqtt': 'mqtt',
    'nats': 'nats',
    'ioredis': 'ioredis',
    'amqplib': 'amqplib',
    'amqp-connection-manager': 'amqp-connection-manager',
    
    // Optional Nest modules
    '@nestjs/microservices': '@nestjs/microservices',
    '@nestjs/websockets': '@nestjs/websockets',
    '@nestjs/platform-socket.io': '@nestjs/platform-socket.io',
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
