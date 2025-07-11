#!/bin/bash

echo "🚀 Preparing Claudify for GitHub"
echo "================================"

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add git remote
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/neno-is-ooo/claudify.git 2>/dev/null || git remote set-url origin https://github.com/neno-is-ooo/claudify.git

# Stage all files
echo "📝 Staging files..."
git add .

# Create initial commit
echo "💾 Creating commit..."
git commit -m "🚀 Initial release of Claudify - Use Claude Code as an LLM provider with subscription flat fee

Features:
- SDK for integrating Claude Code CLI
- No API keys needed - uses Claude subscription
- Streaming support
- WebSocket integration
- CLI tool for quick project setup
- Full demo application
- Comprehensive documentation"

# Show status
echo ""
echo "✅ Repository prepared!"
echo ""
echo "📤 To push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "📦 To publish to npm:"
echo "   cd packages/sdk"
echo "   npm publish"
echo ""
echo "🎉 Claudify is ready to launch!"