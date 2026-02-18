#!/bin/bash
set -e

# Configuration
APP_NAME="kanboard-cli"
VERSION=$(grep '"version":' package.json | cut -d'"' -f4)
ARCH="amd64"
MAINTAINER="iagovar <iagovar@outlook.com>"
DESCRIPTION="Professional CLI for Kanboard management"
BUILD_DIR="dist/deb_build"

echo "🚀 Starting build process for ${APP_NAME} v${VERSION}..."

# 1. Clean previous builds
rm -rf dist/*.deb
rm -rf "$BUILD_DIR"

# 2. Compile standalone binary using Bun
echo "📦 Compiling standalone binary..."
mkdir -p dist
bun build ./src/bin/index.ts --compile --outfile "dist/${APP_NAME}"

# 3. Create Debian structure
echo "📂 Creating .deb structure..."
mkdir -p "$BUILD_DIR/DEBIAN"
mkdir -p "$BUILD_DIR/usr/bin"

# 4. Move binary to the structure
cp "dist/${APP_NAME}" "$BUILD_DIR/usr/bin/"
chmod +x "$BUILD_DIR/usr/bin/${APP_NAME}"

# 5. Create the control file
echo "📝 Generating control file..."
cat <<EOF > "$BUILD_DIR/DEBIAN/control"
Package: ${APP_NAME}
Version: ${VERSION}
Architecture: ${ARCH}
Maintainer: ${MAINTAINER}
Description: ${DESCRIPTION}
 Priority: optional
 Section: utils
EOF

# 6. Build the .deb package
echo "🛠️ Building .deb package..."
dpkg-deb --build "$BUILD_DIR" "dist/${APP_NAME}_${VERSION}_${ARCH}.deb"

# 7. Cleanup temporary files
rm -rf "$BUILD_DIR"
rm "dist/${APP_NAME}"

echo "✅ Success! Package created at: dist/${APP_NAME}_${VERSION}_${ARCH}.deb"
