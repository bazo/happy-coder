#!/bin/bash
# Install happy-coder globally
# Run this script from the project root: ./scripts/install-global.sh

set -e

cd "$(dirname "$0")/.."

echo "Building happy-coder..."
npm run build

echo "Installing globally..."
npm install -g .

echo "Done! You can now use 'happy' and 'happy-mcp' commands globally."
