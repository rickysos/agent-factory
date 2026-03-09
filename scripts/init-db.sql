-- Agent Factory Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    capabilities JSONB DEFAULT '[]',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_deployed_at TIMESTAMP WITH TIME ZONE,
    deployments INTEGER DEFAULT 0
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_complexity INTEGER DEFAULT 5,
    assigned_to UUID REFERENCES agents(id),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 300000 -- 5 minutes
);

-- Task queue for Redis integration
CREATE TABLE task_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id),
    queue_position INTEGER NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Delegation logs
CREATE TABLE delegation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_agent UUID REFERENCES agents(id),
    to_agent UUID REFERENCES agents(id),
    task_id UUID REFERENCES tasks(id),
    decision_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent performance metrics
CREATE TABLE agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id),
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    avg_completion_time_ms INTEGER,
    error_rate DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_task_queue_scheduled_for ON task_queue(scheduled_for);
CREATE INDEX idx_agent_metrics_created_at ON agent_metrics(created_at);

-- Insert sample agents (similar to OpenClaw setup)
INSERT INTO agents (name, description, model, status, capabilities) VALUES
('orchestrator', 'Top-level agent coordinator', 'deepseek-v3.2', 'active', '["task_classification", "agent_delegation", "result_synthesis"]'),
('coder', 'Senior developer agent', 'deepseek-v3.2', 'active', '["nextjs_development", "github_pr_management", "bug_fixes"]'),
('marketing', 'Marketing content agent', 'gemini-2.5-flash-lite', 'active', '["content_generation", "seo_optimization", "campaign_management"]'),
('vigil', 'Monitoring agent', 'glm-4.5-air', 'active', '["health_checks", "error_monitoring", "performance_tracking"]'),
('security', 'Security auditor agent', 'deepseek-v3.2', 'active', '["vulnerability_assessment", "code_review", "compliance_checking"]');