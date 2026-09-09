#!/bin/bash
set -e
echo "🚀 Starting deployment..."

if ! command -v wrangler &> /dev/null; then echo "❌ Wrangler not found. Installing..."; npm install -g wrangler; fi
if ! wrangler whoami &> /dev/null; then echo "❌ Not logged in. Run: wrangler login"; exit 1; fi

echo "✅ Wrangler ready"
echo "📦 Building frontend..."
npm run build

KV_ID=$(grep -oP 'id = "\K[^"]+' wrangler.toml | head -1)
if [ -z "$KV_ID" ] || [ "$KV_ID" = "YOUR_KV_NAMESPACE_ID" ]; then
    echo "📝 Creating KV namespace..."
    KV_OUTPUT=$(wrangler kv:namespace create "KV" --preview=false)
    KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+')
    sed -i "s/YOUR_KV_NAMESPACE_ID/$KV_ID/" wrangler.toml
    echo "✅ KV created: $KV_ID"
fi

echo "🚀 Deploying..."
wrangler deploy

echo "✅ Done! Visit your worker URL."
echo "📊 Commands: wrangler tail | wrangler secret list"
