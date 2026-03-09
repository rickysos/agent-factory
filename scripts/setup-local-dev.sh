#!/bin/bash

# Local development setup for Agent Factory (no Docker required)

echo "=== SETTING UP AGENT FACTORY LOCAL DEVELOPMENT ==="
echo ""

# Check for required tools
echo "1. Checking prerequisites..."
which node > /dev/null || { echo "❌ Node.js not installed"; exit 1; }
which npm > /dev/null || { echo "❌ npm not installed"; exit 1; }
which git > /dev/null || { echo "❌ git not installed"; exit 1; }
echo "✅ Prerequisites OK"

echo ""
echo "2. Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "3. Setting up environment..."
if [ ! -f .env.local ]; then
  cat > .env.local << 'EOF'
# Agent Factory Local Development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=sqlite:./data/agent-factory.db
REDIS_URL=redis://localhost:6379

# Optional API Keys (uncomment and add your own)
# OPENROUTER_API_KEY=your-key-here
# GITHUB_TOKEN=your-token-here
# SENTRY_AUTH_TOKEN=your-token-here
# VERCEL_TOKEN=your-token-here

EOF
  echo "✅ Created .env.local file"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "4. Creating data directory..."
mkdir -p data
echo "✅ Data directory created"

echo ""
echo "5. Starting development services in separate terminals..."

echo ""
echo "=== STARTUP INSTRUCTIONS ==="
echo ""
echo "Open 4 terminal windows and run:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  cd $(pwd)"
echo "  npm run dev"
echo ""
echo "Terminal 2 (API Server):"
echo "  cd $(pwd)"
echo "  npm run api:dev"
echo ""
echo "Terminal 3 (Redis):"
echo "  brew services start redis  # If using Homebrew"
echo "  # OR download Redis from redis.io"
echo ""
echo "Terminal 4 (Optional - SQLite browser):"
echo "  # Install DB Browser for SQLite or use sqlite3 CLI"
echo ""
echo "=== ACCESS POINTS ==="
echo ""
echo "Once started, access:"
echo "• Frontend: http://localhost:3000"
echo "• API: http://localhost:3001"
echo "• API Docs: http://localhost:3001/api/tasks"
echo "• Redis: localhost:6379"
echo ""
echo "=== QUICK START ==="
echo ""
echo "To start just the frontend and API (without Redis):"
echo "1. Terminal 1: npm run dev"
echo "2. Terminal 2: npm run api:dev"
echo ""
echo "The app will use in-memory task queue if Redis is unavailable."