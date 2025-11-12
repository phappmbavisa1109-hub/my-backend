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

# Patch bcrypt to define __dirname at module load time and replace path require
if [ -f "node_modules/bcrypt/bcrypt.js" ]; then
  # Check if already patched
  if ! grep -q "WORKERS_PATCHED" node_modules/bcrypt/bcrypt.js; then
    # Use sed to:
    # 1. Add polyfill at start
    # 2. Replace "const path = require('path')" with conditional
    sed -i '1s/^/\/\/ WORKERS_PATCHED: Cloudflare Workers compatibility\nconst __dirname = typeof __dirname !== '\''undefined'\'' ? __dirname : '\''/worker'\'';\n/' node_modules/bcrypt/bcrypt.js
    sed -i "s/const path = require('path');/const path = (typeof require !== 'undefined' && require('path')) || { resolve: (...args) => '\/\/' + args.join('\/'), join: (...args) => args.join('\/'), dirname: (p) => p.split('\/').slice(0, -1).join('\/')};/" node_modules/bcrypt/bcrypt.js
  fi
fi

# Patch bcrypt/build/Release/bcrypt_lib.js if it exists
if [ -f "node_modules/bcrypt/build/Release/bcrypt_lib.js" ]; then
  if ! grep -q "const __dirname" node_modules/bcrypt/build/Release/bcrypt_lib.js; then
    # Prepend __dirname definition
    echo "const __dirname = typeof __dirname !== 'undefined' ? __dirname : '/worker';" > /tmp/bcrypt_lib_temp.js
    cat node_modules/bcrypt/build/Release/bcrypt_lib.js >> /tmp/bcrypt_lib_temp.js
    mv /tmp/bcrypt_lib_temp.js node_modules/bcrypt/build/Release/bcrypt_lib.js
  fi
fi

echo "✓ Cloudflare Workers patches applied"


