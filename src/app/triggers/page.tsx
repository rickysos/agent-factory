'use client';

import { useState, useEffect } from 'react';

interface Execution {
  id: string;
  timestamp: string;
  status: 'success' | 'failure';
  duration: string;
  output: string;
}

interface Trigger {
  id: string;
  name: string;
  type: 'webhook' | 'cron' | 'github' | 'slack' | 'email' | 'polling';
  status: 'active' | 'paused' | 'error';
  agentId: string;
  agentName: string;
  lastFired: string | null;
  fireCount: number;
  config: Record<string, string>;
  webhookUrl?: string;
  executions: Execution[];
}

interface Agent {
  id: string;
  name: string;
}

const typeIcons: Record<string, string> = {
  webhook: '\u26A1',
  cron: '\u23F0',
  github: 'GH',
  slack: '#',
  email: '\u2709',
  polling: '\u21BB',
};

const statusColors: Record<string, string> = {
  active: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  paused: 'bg-amber-500/10 text-amber-600 dark:bg-amber-800 dark:text-yellow-300',
  error: 'bg-red-500/50/10 text-red-500 dark:bg-red-900 dark:text-red-300',
};

const typeBadgeColors: Record<string, string> = {
  webhook: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  cron: 'bg-forge-200 text-forge-700 dark:bg-forge-800 dark:text-forge-300',
  github: 'bg-forge-200 text-forge-700 dark:bg-forge-700 dark:text-forge-300',
  slack: 'bg-red-500/10 text-pink-800 dark:bg-red-800 dark:text-pink-300',
  email: 'bg-amber-500/10 text-amber-600 dark:bg-amber-800 dark:text-orange-300',
  polling: 'bg-teal-500/10 text-teal-800 dark:bg-teal-800 dark:text-teal-300',
};

const filterTabs = ['All', 'Webhook', 'Cron', 'GitHub', 'Slack', 'Polling'] as const;

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTrigger, setNewTrigger] = useState({ name: '', type: 'webhook', agentId: '', cronExpression: '', timezone: 'UTC', repo: '', githubEvents: '', slackChannel: '', slackEvents: '', pollingUrl: '', pollingInterval: '60' });
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [triggerRes, agentRes] = await Promise.all([
          fetch('/api/triggers').then(r => r.ok ? r.json() : []),
          fetch('/api/agents').then(r => r.ok ? r.json() : []),
        ]);
        setTriggers(Array.isArray(triggerRes) ? triggerRes : triggerRes.triggers || []);
        setAgents(Array.isArray(agentRes) ? agentRes : agentRes.agents || []);
      } catch {
        setTriggers([]);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = activeFilter === 'All'
    ? triggers
    : triggers.filter(t => t.type === activeFilter.toLowerCase());

  const stats = {
    total: triggers.length,
    active: triggers.filter(t => t.status === 'active').length,
    fires24h: triggers.reduce((sum, t) => sum + t.fireCount, 0),
    successRate: triggers.length > 0
      ? Math.round(triggers.flatMap(t => t.executions).filter(e => e?.status === 'success').length / Math.max(triggers.flatMap(t => t.executions).length, 1) * 100)
      : 0,
  };

  async function handleToggleStatus(trigger: Trigger) {
    const next = trigger.status === 'active' ? 'paused' : 'active';
    setTriggers(prev => prev.map(t => t.id === trigger.id ? { ...t, status: next } : t));
  }

  async function handleTestFire(id: string) {
    setTestingId(id);
    try {
      await fetch(`/api/triggers/${id}/fire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: true, timestamp: new Date().toISOString() }),
      });
    } catch { /* ignore */ }
    setTimeout(() => setTestingId(null), 1500);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this trigger?')) return;
    setTriggers(prev => prev.filter(t => t.id !== id));
  }

  async function handleCreate() {
    const config: Record<string, string> = {};
    if (newTrigger.type === 'cron') { config.expression = newTrigger.cronExpression; config.timezone = newTrigger.timezone; }
    if (newTrigger.type === 'github') { config.repo = newTrigger.repo; config.events = newTrigger.githubEvents; }
    if (newTrigger.type === 'slack') { config.channel = newTrigger.slackChannel; config.events = newTrigger.slackEvents; }
    if (newTrigger.type === 'polling') { config.url = newTrigger.pollingUrl; config.interval = newTrigger.pollingInterval; }

    const created: Trigger = {
      id: crypto.randomUUID(),
      name: newTrigger.name,
      type: newTrigger.type as Trigger['type'],
      status: 'active',
      agentId: newTrigger.agentId,
      agentName: agents.find(a => a.id === newTrigger.agentId)?.name || 'Unknown',
      lastFired: null,
      fireCount: 0,
      config,
      webhookUrl: newTrigger.type === 'webhook' ? `https://agent-factory.dev/hooks/${crypto.randomUUID().slice(0, 8)}` : undefined,
      executions: [],
    };
    setTriggers(prev => [created, ...prev]);
    setShowCreate(false);
    setNewTrigger({ name: '', type: 'webhook', agentId: '', cronExpression: '', timezone: 'UTC', repo: '', githubEvents: '', slackChannel: '', slackEvents: '', pollingUrl: '', pollingInterval: '60' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-forge-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-forge-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100">Trigger Management</h1>
        <p className="mt-1 text-forge-400 dark:text-forge-500">Webhook, cron, and event-driven agent triggers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Triggers', value: stats.total, color: 'text-accent-600' },
          { label: 'Active', value: stats.active, color: 'text-accent-600' },
          { label: 'Total Fires (24h)', value: stats.fires24h, color: 'text-forge-500' },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-teal-600' },
        ].map(s => (
          <div key={s.label} className="bg-forge-50 dark:bg-forge-900 rounded-md shadow p-5">
            <p className="text-sm text-forge-400 dark:text-forge-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-forge-200 dark:bg-forge-800 rounded p-1">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-forge-50 dark:bg-forge-700 text-accent-600 dark:text-accent-400 '
                  : 'text-forge-400 dark:text-forge-500 hover:text-forge-600 dark:hover:text-forge-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-accent-500 text-forge-950 rounded hover:bg-accent-400 font-medium text-sm"
        >
          + Create Trigger
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-forge-50 dark:bg-forge-900 rounded-md  max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-forge-800 dark:text-forge-100 mb-4">Create Trigger</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Name</label>
                <input value={newTrigger.name} onChange={e => setNewTrigger(p => ({ ...p, name: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="My Trigger" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Type</label>
                <select value={newTrigger.type} onChange={e => setNewTrigger(p => ({ ...p, type: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100">
                  <option value="webhook">Webhook</option>
                  <option value="cron">Cron</option>
                  <option value="github">GitHub</option>
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="polling">Polling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Agent</label>
                <select value={newTrigger.agentId} onChange={e => setNewTrigger(p => ({ ...p, agentId: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100">
                  <option value="">Select agent...</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {newTrigger.type === 'webhook' && (
                <div className="p-3 bg-forge-100 dark:bg-forge-850 rounded">
                  <p className="text-xs text-forge-400 dark:text-forge-500 mb-1">Webhook URL (auto-generated on create)</p>
                  <p className="text-sm font-mono text-accent-600 dark:text-accent-400">https://agent-factory.dev/hooks/&#123;id&#125;</p>
                </div>
              )}
              {newTrigger.type === 'cron' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Cron Expression</label>
                    <input value={newTrigger.cronExpression} onChange={e => setNewTrigger(p => ({ ...p, cronExpression: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm font-mono text-forge-800 dark:text-forge-100" placeholder="0 */6 * * *" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Timezone</label>
                    <input value={newTrigger.timezone} onChange={e => setNewTrigger(p => ({ ...p, timezone: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="UTC" />
                  </div>
                </>
              )}
              {newTrigger.type === 'github' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Repository</label>
                    <input value={newTrigger.repo} onChange={e => setNewTrigger(p => ({ ...p, repo: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="owner/repo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Events (comma-separated)</label>
                    <input value={newTrigger.githubEvents} onChange={e => setNewTrigger(p => ({ ...p, githubEvents: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="push, pull_request" />
                  </div>
                </>
              )}
              {newTrigger.type === 'slack' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Channel</label>
                    <input value={newTrigger.slackChannel} onChange={e => setNewTrigger(p => ({ ...p, slackChannel: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="#general" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Events (comma-separated)</label>
                    <input value={newTrigger.slackEvents} onChange={e => setNewTrigger(p => ({ ...p, slackEvents: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="message, reaction_added" />
                  </div>
                </>
              )}
              {newTrigger.type === 'polling' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">URL to Poll</label>
                    <input value={newTrigger.pollingUrl} onChange={e => setNewTrigger(p => ({ ...p, pollingUrl: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="https://api.example.com/data" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forge-600 dark:text-forge-300 mb-1">Interval (seconds)</label>
                    <input type="number" value={newTrigger.pollingInterval} onChange={e => setNewTrigger(p => ({ ...p, pollingInterval: e.target.value }))} className="w-full rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-3 py-2 text-sm text-forge-800 dark:text-forge-100" placeholder="60" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-forge-600 dark:text-forge-300 hover:bg-forge-200 dark:hover:bg-forge-850 rounded">Cancel</button>
              <button onClick={handleCreate} disabled={!newTrigger.name || !newTrigger.agentId} className="px-4 py-2 text-sm bg-accent-500 text-forge-950 rounded hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-forge-50 dark:bg-forge-900 rounded-md shadow">
          <p className="text-forge-400 dark:text-forge-500 text-lg">No triggers found</p>
          <p className="text-forge-300 dark:text-forge-400 text-sm mt-1">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(trigger => (
            <div key={trigger.id} className="bg-forge-50 dark:bg-forge-900 rounded-md shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-forge-200 dark:bg-forge-800 flex items-center justify-center text-lg font-bold text-forge-500 dark:text-forge-300">
                      {typeIcons[trigger.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-forge-800 dark:text-forge-100">{trigger.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeBadgeColors[trigger.type]}`}>{trigger.type}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[trigger.status]}`}>{trigger.status}</span>
                      </div>
                      <p className="text-sm text-forge-400 dark:text-forge-500 mt-0.5">
                        Agent: <span className="font-medium text-forge-600 dark:text-forge-300">{trigger.agentName}</span>
                        <span className="mx-2">|</span>
                        Last fired: {trigger.lastFired ? new Date(trigger.lastFired).toLocaleString() : 'Never'}
                        <span className="mx-2">|</span>
                        Fires: {trigger.fireCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(trigger)}
                      className={`px-3 py-1.5 text-xs font-medium rounded ${
                        trigger.status === 'active'
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-200 dark:bg-amber-800 dark:text-yellow-300'
                          : 'bg-accent-500/10 text-accent-600 hover:bg-accent-200 dark:bg-accent-500/10 dark:text-accent-400'
                      }`}
                    >
                      {trigger.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleTestFire(trigger.id)}
                      disabled={testingId === trigger.id}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-accent-500/10 text-accent-600 hover:bg-accent-500/20 dark:bg-accent-500/10 dark:text-accent-400 disabled:opacity-50"
                    >
                      {testingId === trigger.id ? 'Firing...' : 'Test Fire'}
                    </button>
                    <button
                      onClick={() => handleDelete(trigger.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-red-500/50/10 text-red-500 hover:bg-red-500/50/15 dark:bg-red-900 dark:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === trigger.id ? null : trigger.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-forge-200 text-forge-600 hover:bg-forge-200 dark:bg-forge-850 dark:text-forge-300"
                    >
                      {expandedId === trigger.id ? 'Collapse' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === trigger.id && (
                <div className="border-t border-forge-200 dark:border-forge-800 px-5 py-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-forge-600 dark:text-forge-300 mb-2">Configuration</h4>
                    <div className="bg-forge-100 dark:bg-forge-850 rounded p-3 space-y-1">
                      {trigger.webhookUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-forge-400 dark:text-forge-500 w-24">Webhook URL</span>
                          <code className="text-xs font-mono text-accent-600 dark:text-accent-400">{trigger.webhookUrl}</code>
                        </div>
                      )}
                      {Object.entries(trigger.config).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-forge-400 dark:text-forge-500 w-24 capitalize">{key}</span>
                          <span className="text-xs font-mono text-forge-800 dark:text-forge-100">{val}</span>
                        </div>
                      ))}
                      {Object.keys(trigger.config).length === 0 && !trigger.webhookUrl && (
                        <p className="text-xs text-forge-300 dark:text-forge-400">No configuration details</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-forge-600 dark:text-forge-300 mb-2">Recent Executions</h4>
                    {trigger.executions.length === 0 ? (
                      <p className="text-xs text-forge-300 dark:text-forge-400">No executions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {trigger.executions.slice(0, 5).map(exec => (
                          <div key={exec.id} className="flex items-center justify-between bg-forge-100 dark:bg-forge-850 rounded px-3 py-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${exec.status === 'success' ? 'bg-accent-500' : 'bg-red-500/50'}`} />
                              <span className="text-xs text-forge-600 dark:text-forge-300">{new Date(exec.timestamp).toLocaleString()}</span>
                              <span className={`text-xs font-medium ${exec.status === 'success' ? 'text-accent-600 dark:text-accent-400' : 'text-red-500 dark:text-red-400'}`}>{exec.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-forge-400 dark:text-forge-500">{exec.duration}</span>
                              <span className="text-xs text-forge-400 dark:text-forge-500 max-w-xs truncate">{exec.output}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}