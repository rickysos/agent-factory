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
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const typeBadgeColors: Record<string, string> = {
  webhook: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  cron: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  github: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  slack: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  email: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  polling: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
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
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-950 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trigger Management</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Webhook, cron, and event-driven agent triggers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Triggers', value: stats.total, color: 'text-blue-600' },
          { label: 'Active', value: stats.active, color: 'text-green-600' },
          { label: 'Total Fires (24h)', value: stats.fires24h, color: 'text-purple-600' },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-teal-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Create Trigger
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Trigger</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={newTrigger.name} onChange={e => setNewTrigger(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="My Trigger" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={newTrigger.type} onChange={e => setNewTrigger(p => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                  <option value="webhook">Webhook</option>
                  <option value="cron">Cron</option>
                  <option value="github">GitHub</option>
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="polling">Polling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent</label>
                <select value={newTrigger.agentId} onChange={e => setNewTrigger(p => ({ ...p, agentId: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white">
                  <option value="">Select agent...</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {newTrigger.type === 'webhook' && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Webhook URL (auto-generated on create)</p>
                  <p className="text-sm font-mono text-blue-600 dark:text-blue-400">https://agent-factory.dev/hooks/&#123;id&#125;</p>
                </div>
              )}
              {newTrigger.type === 'cron' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cron Expression</label>
                    <input value={newTrigger.cronExpression} onChange={e => setNewTrigger(p => ({ ...p, cronExpression: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white" placeholder="0 */6 * * *" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                    <input value={newTrigger.timezone} onChange={e => setNewTrigger(p => ({ ...p, timezone: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="UTC" />
                  </div>
                </>
              )}
              {newTrigger.type === 'github' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repository</label>
                    <input value={newTrigger.repo} onChange={e => setNewTrigger(p => ({ ...p, repo: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="owner/repo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Events (comma-separated)</label>
                    <input value={newTrigger.githubEvents} onChange={e => setNewTrigger(p => ({ ...p, githubEvents: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="push, pull_request" />
                  </div>
                </>
              )}
              {newTrigger.type === 'slack' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel</label>
                    <input value={newTrigger.slackChannel} onChange={e => setNewTrigger(p => ({ ...p, slackChannel: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="#general" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Events (comma-separated)</label>
                    <input value={newTrigger.slackEvents} onChange={e => setNewTrigger(p => ({ ...p, slackEvents: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="message, reaction_added" />
                  </div>
                </>
              )}
              {newTrigger.type === 'polling' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL to Poll</label>
                    <input value={newTrigger.pollingUrl} onChange={e => setNewTrigger(p => ({ ...p, pollingUrl: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="https://api.example.com/data" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval (seconds)</label>
                    <input type="number" value={newTrigger.pollingInterval} onChange={e => setNewTrigger(p => ({ ...p, pollingInterval: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="60" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={!newTrigger.name || !newTrigger.agentId} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl shadow">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No triggers found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(trigger => (
            <div key={trigger.id} className="bg-white dark:bg-gray-900 rounded-xl shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                      {typeIcons[trigger.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{trigger.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeBadgeColors[trigger.type]}`}>{trigger.type}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[trigger.status]}`}>{trigger.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Agent: <span className="font-medium text-gray-700 dark:text-gray-300">{trigger.agentName}</span>
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                        trigger.status === 'active'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                      }`}
                    >
                      {trigger.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleTestFire(trigger.id)}
                      disabled={testingId === trigger.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 disabled:opacity-50"
                    >
                      {testingId === trigger.id ? 'Firing...' : 'Test Fire'}
                    </button>
                    <button
                      onClick={() => handleDelete(trigger.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === trigger.id ? null : trigger.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {expandedId === trigger.id ? 'Collapse' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === trigger.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Configuration</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1">
                      {trigger.webhookUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-24">Webhook URL</span>
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">{trigger.webhookUrl}</code>
                        </div>
                      )}
                      {Object.entries(trigger.config).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 capitalize">{key}</span>
                          <span className="text-xs font-mono text-gray-900 dark:text-gray-100">{val}</span>
                        </div>
                      ))}
                      {Object.keys(trigger.config).length === 0 && !trigger.webhookUrl && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">No configuration details</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Executions</h4>
                    {trigger.executions.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">No executions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {trigger.executions.slice(0, 5).map(exec => (
                          <div key={exec.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${exec.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-xs text-gray-700 dark:text-gray-300">{new Date(exec.timestamp).toLocaleString()}</span>
                              <span className={`text-xs font-medium ${exec.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{exec.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{exec.duration}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{exec.output}</span>
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