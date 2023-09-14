#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Loading azd .env file from current environment"
azd env get-values > .env
source .env

echo 'Installing dependencies'
npm ci

echo 'Running "index-files" CLI tool'
npx index-files --wait --indexer-url "${INDEXER_API_URI}" ./data/*.md
