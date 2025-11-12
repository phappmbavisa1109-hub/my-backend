#!/bin/bash
# postinstall.sh - Create stub files and patch modules for Cloudflare Workers

mkdir -p node_modules/@nestjs/websockets
mkdir -p node_modules/@nestjs/microservices

# Create stub files
echo "module.exports = {};" > node_modules/@nestjs/websockets/index.js
echo "module.exports = {};" > node_modules/@nestjs/websockets/socket-module.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/index.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/microservices-module.js

# Patch app-root-path to work in Cloudflare Workers ESM
if [ -f "node_modules/app-root-path/index.js" ]; then
  cat > node_modules/app-root-path/index.js << 'EOF'
// Patched for Cloudflare Workers
module.exports = {
  resolve: function(path) {
    return '/worker/' + (path || '');
  },
  setPath: function(path) {
    this.appRootPath = path;
  },
  toString: function() {
    return '/worker';
  },
  appRootPath: '/worker'
};
module.exports.appRootPath = '/worker';
EOF
fi

echo "✓ Stub files and patches applied for Cloudflare Workers"

