/**
 * Webpack configuration for NestJS + Cloudflare Workers
 * 
 * This config:
 * 1. Bundles all required dependencies
 * 2. Marks optional packages as external (they'll be require() calls in the bundle)
 * 3. Outputs a single main.js file suitable for Cloudflare Workers
 */

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
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
  // Mark packages that will fail at runtime as external
  // They won't be bundled, and NestJS has try-catch for them
  externals: {
    // Optional microservices transports
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
