#!/bin/bash

echo "=== STARTING AGENT FACTORY DEVELOPMENT ==="
echo ""

# Function to cleanup on exit
cleanup() {
  echo "Stopping development servers..."
  kill $FRONTEND_PID $API_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "1. Starting API server..."
node src/server/api-server.js &
API_PID=$!
echo "✅ API server started (PID: $API_PID)"
echo "   API: http://localhost:3001"
echo "   Health: http://localhost:3001/health"
echo ""

sleep 2

echo "2. Starting frontend..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Frontend: http://localhost:3000"
echo ""

echo "=== DEVELOPMENT SERVERS RUNNING ==="
echo ""
echo "Access points:"
echo "• Frontend: http://localhost:3000"
echo "• API Server: http://localhost:3001"
echo "• API Health: http://localhost:3001/health"
echo "• Task Queue: http://localhost:3001/api/tasks"
echo "• Agents: http://localhost:3001/api/agents"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait $FRONTEND_PID $API_PID