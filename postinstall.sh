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

# Patch bcrypt to define __dirname at module load time
if [ -f "node_modules/bcrypt/bcrypt.js" ]; then
  # Extract everything after the first line and prepend __dirname definition
  tail -n +2 node_modules/bcrypt/bcrypt.js > /tmp/bcrypt_temp.js
  cat > node_modules/bcrypt/bcrypt.js << 'EOF'
const __dirname = typeof __dirname !== 'undefined' ? __dirname : '/worker';
EOF
  cat /tmp/bcrypt_temp.js >> node_modules/bcrypt/bcrypt.js
  rm /tmp/bcrypt_temp.js
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


