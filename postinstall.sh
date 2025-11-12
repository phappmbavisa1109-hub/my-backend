#!/bin/bash
# postinstall.sh - Patches and stubs for Cloudflare Workers ESM compatibility

mkdir -p node_modules/@nestjs/websockets
mkdir -p node_modules/@nestjs/microservices

# Create stub files for optional packages
echo "module.exports = {};" > node_modules/@nestjs/websockets/index.js
echo "module.exports = {};" > node_modules/@nestjs/websockets/socket-module.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/index.js
echo "module.exports = {};" > node_modules/@nestjs/microservices/microservices-module.js

# Patch app-root-path browser-shim.js (gets bundled by esbuild)
if [ -f "node_modules/app-root-path/browser-shim.js" ]; then
  cat > node_modules/app-root-path/browser-shim.js << 'EOF'
// Patched for Cloudflare Workers - return dummy path instead of accessing undefined
module.exports = {
  resolve: function(path) {
    return '/worker/' + (path || '');
  },
  toString: function() {
    return '/worker';
  },
  appRootPath: '/worker'
};
EOF
fi

# Also patch index.js as fallback
if [ -f "node_modules/app-root-path/index.js" ]; then
  cat > node_modules/app-root-path/index.js << 'EOF'
module.exports = {
  resolve: function(path) {
    return '/worker/' + (path || '');
  },
  toString: function() {
    return '/worker';
  },
  appRootPath: '/worker'
};
module.exports.appRootPath = '/worker';
EOF
fi

echo "✓ Cloudflare Workers patches applied"


