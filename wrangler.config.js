/**
 * Wrangler Configuration for NestJS + Cloudflare Workers
 * 
 * This config tells esbuild to treat optional microservices packages as external.
 * NestJS tries to require these packages dynamically, but they're not used in this REST API.
 * By marking them as external, esbuild won't try to bundle them.
 */

export default {
  name: 'veolagi',
  main: 'dist/main.js',
  compatibility_date: '2025-11-01',
  compatibility_flags: ['nodejs_compat'],

  build: {
    // Mark optional microservices packages as external
    // esbuild will leave these as require() calls in the bundle instead of trying to resolve them
    external: [
      // Microservices - gRPC
      '@grpc/grpc-js',
      '@grpc/proto-loader',
      
      // Microservices - Kafka
      'kafkajs',
      
      // Microservices - MQTT
      'mqtt',
      
      // Microservices - NATS
      'nats',
      
      // Microservices - Redis
      'ioredis',
      
      // Microservices - RabbitMQ (AMQP)
      'amqplib',
      'amqp-connection-manager',
      
      // WebSockets - Socket.io
      '@nestjs/platform-socket.io',
      
      // Optional Nest modules
      '@nestjs/microservices',
      '@nestjs/websockets',
    ],
  },
};
