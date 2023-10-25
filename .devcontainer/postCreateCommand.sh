#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Installing playwright browsers..."
npm run install:playwright
