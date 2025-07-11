#!/bin/bash

# Claude Code SDK Complete - Setup Script

echo "🚀 Claude Code SDK Complete Setup"
echo "================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Extract major version
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
if [ $MAJOR_VERSION -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Check if Claude Code CLI is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is not installed."
    echo "   Please install it from: https://claude.ai/code"
    echo ""
    echo "   After installation, run: claude code login"
    exit 1
fi

echo "✅ Claude Code CLI is installed"

# Check if logged in
claude code status &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  You may not be logged in to Claude Code."
    echo "   Run: claude code login"
    echo ""
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build SDK
echo ""
echo "🔨 Building SDK..."
npm run build:sdk

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Quick Start:"
echo "   1. Run the demo:     npm run demo"
echo "   2. Try examples:     cd examples/basic-chat && npm start"
echo "   3. Read the docs:    open docs/README.md"
echo ""
echo "📚 Documentation:"
echo "   - API Reference:     docs/API_REFERENCE.md"
echo "   - LLM Guide:         docs/LLM_INTEGRATION_GUIDE.md"
echo "   - Architecture:      docs/ARCHITECTURE.md"
echo ""
echo "Happy coding! 🎉"