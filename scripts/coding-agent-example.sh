#!/bin/bash

# Example of using coding-agent with Agent Factory project
# This shows how the coding-agent skill would be invoked in OpenClaw

echo "=== CODING-AGENT EXAMPLE: AGENT FACTORY ==="
echo "Project: Agent Factory - AI Agent Development Platform"
echo "Location: /Users/bots/openclaw/workspace-orchestrator/agent-factory"
echo ""

# Example 1: Quick analysis of project structure
echo "1. PROJECT ANALYSIS WITH CLAUDE CODE:"
echo "--------------------------------------"
echo "Command that would be run in OpenClaw:"
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory command:"claude \"Analyze this Agent Factory project and suggest improvements based on multi-agent delegation patterns\""'
echo ""

# Example 2: Adding a feature
echo "2. ADDING DELEGATION LOGGING FEATURE:"
echo "--------------------------------------"
echo "Command that would be run in OpenClaw:"
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory command:"claude \"Create a delegation logging system that tracks: 1. Task assignment, 2. Agent performance, 3. Completion times, 4. Error rates. Store in SQLite database with dashboard.\""'
echo ""

# Example 3: Refactoring
echo "3. REFACTOR AGENT CONFIGURATION SYSTEM:"
echo "---------------------------------------"
echo "Command that would be run in OpenClaw:"
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory command:"claude \"Refactor the agent configuration system to use YAML instead of JSON, add validation, and create a configuration migration script.\""'
echo ""

# Example 4: Parallel task processing
echo "4. PARALLEL TASK PROCESSING SYSTEM:"
echo "-----------------------------------"
echo "Commands that would be run in parallel:"
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory background:true command:"claude \"Create task queue system with Redis\" sessionId:task-queue"'
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory background:true command:"claude \"Implement worker pool for parallel task execution\" sessionId:worker-pool"'
echo 'bash pty:true workdir:/Users/bots/openclaw/workspace-orchestrator/agent-factory background:true command:"claude \"Add monitoring dashboard for task queue\" sessionId:monitoring"'
echo ""

echo "=== HOW TO MONITOR BACKGROUND TASKS ==="
echo "After starting background tasks, you can monitor them:"
echo 'process action:list  # List all running sessions'
echo 'process action:log sessionId:task-queue  # Get output from task-queue'
echo 'process action:poll sessionId:worker-pool  # Check if still running'
echo 'process action:kill sessionId:monitoring  # Stop if needed'
echo ""

echo "=== REAL-WORLD USE CASE ==="
echo "Agent Factory could use coding-agent to:"
echo "1. Auto-generate agent templates"
echo "2. Fix bugs reported by users"
echo "3. Implement feature requests"
echo "4. Write documentation"
echo "5. Create deployment scripts"
echo "6. Optimize performance"
echo "7. Add new integrations (Slack, Discord, etc.)"
echo ""

echo "=== INTEGRATION WITH AGENT FACTORY ==="
echo "The coding-agent would be one of the specialized agents"
echo "in Agent Factory's delegation system:"
echo ""
echo "1. User requests feature → Orchestrator receives request"
echo "2. Orchestrator classifies as 'coding' task"
echo "3. Delegates to coder agent"
echo "4. Coder agent uses coding-agent (Claude Code) to implement"
echo "5. Results returned to Orchestrator → User"