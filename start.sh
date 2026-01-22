#!/bin/sh
set -e

export IPFS_PATH=/data/ipfs

# Init IPFS once
if [ ! -f "$IPFS_PATH/config" ]; then
  echo "📦 Initializing IPFS..."
  ipfs init --profile server
fi

# Expose API + Gateway to container
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080

echo "🚀 Starting IPFS daemon..."
ipfs daemon --enable-gc &

# Wait for IPFS API
until ipfs id >/dev/null 2>&1; do
  echo "⏳ Waiting for IPFS..."
  sleep 1
done

echo "🚀 Starting Express server..."
node index.js