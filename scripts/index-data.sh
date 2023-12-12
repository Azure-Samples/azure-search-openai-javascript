#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Loading azd .env file from current environment"
export $(azd env get-values | xargs)

echo 'Installing dependencies and building CLI'
npm ci
npm run build --workspace=indexer

echo 'Running "index-files" CLI tool'
npx index-files \
  --wait \
  --indexer-url "${INDEXER_API_URI}" \
  --index-name "${AZURE_SEARCH_INDEX}" \
  ./data/*.*
