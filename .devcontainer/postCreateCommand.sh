#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Installing playwright browsers..."
npx playwright install --with-deps
