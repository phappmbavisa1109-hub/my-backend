#!/bin/bash
# postinstall.sh - Create stub files for optional packages that Wrangler/esbuild can't resolve

mkdir -p node_modules/@nestjs/websockets
mkdir -p node_modules/@nestjs/microservices

# Create stub files
echo "module.exports = {};" > node_modules/@nestjs/websockets/index.js
echo "module.exports = {};" > node_modules/@nestjs/websockets/socket-module.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/index.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/microservices-module.js

echo "✓ Stub files created for optional packages"
