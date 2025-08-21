#!/bin/bash
# Node.js v20.16.0 Setup Script for this project

echo "Setting up Node.js v20.16.0 environment..."

# Add nvm nodejs to PATH for this session
export PATH="/c/nvm4w/nodejs:$PATH"

# Verify version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Create aliases for convenience
alias node-20='/c/nvm4w/nodejs/node.exe'
alias npm-20='/c/nvm4w/nodejs/npm.cmd'

echo "Environment ready! Use 'node-20' and 'npm-20' for explicit v20.16.0 usage."
echo "Or just use 'node' and 'npm' - they should now point to v20.16.0"
