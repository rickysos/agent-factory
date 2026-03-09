'use client'

import { useState } from 'react'

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: string
  channel: 'slack' | 'pagerduty' | 'email'
  channelTarget: string
  enabled: boolean
}

interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  resolved: boolean
}

const initialRules: AlertRule[] = [
  { id: 'rule-001', name: 'High Error Rate', condition: 'error_rate', threshold: '> 5%', channel: 'pagerduty', channelTarget: 'pd-service-key-xxxx', enabled: true },
  { id: 'rule-002', name: 'Cost Spike', condition: 'hourly_cost', threshold: '> $25', channel: 'slack', channelTarget: '#ops-alerts', enabled: true },
  { id: 'rule-003', name: 'Agent Failure', condition: 'consecutive_failures', threshold: '>= 3', channel: 'pagerduty', channelTarget: 'pd-service-key-xxxx', enabled: true },
  { id: 'rule-004', name: 'High Latency', condition: 'avg_latency', threshold: '> 5000ms', channel: 'slack', channelTarget: '#perf-alerts', enabled: false },
  { id: 'rule-005', name: 'Token Budget Exceeded', condition: 'daily_tokens', threshold: '> 1,000,000', channel: 'email', channelTarget: 'team@company.com', enabled: true },
]

const alertHistory: AlertEvent[] = [
  { id: 'evt-010', ruleId: 'rule-003', ruleName: 'Agent Failure', timestamp: '2026-03-09T14:18:22Z', severity: 'critical', message: 'deploy-bot failed 3 consecutive tasks. Last error: test suite failure.', resolved: true },
  { id: 'evt-009', ruleId: 'rule-002', ruleName: 'Cost Spike', timestamp: '2026-03-09T12:02:11Z', severity: 'warning', message: 'Hourly cost reached $28.40 (threshold: $25). security-scanner ran 8 deep scans.', resolved: true },
  { id: 'evt-008', ruleId: 'rule-001', ruleName: 'High Error Rate', timestamp: '2026-03-09T09:44:05Z', severity: 'critical', message: 'Error rate at 8.2% over last 15 min. deploy-bot: 4 errors, support-agent: 2 errors.', resolved: true },
  { id: 'evt-007', ruleId: 'rule-005', ruleName: 'Token Budget Exceeded', timestamp: '2026-03-08T23:00:01Z', severity: 'warning', message: 'Daily token usage hit 1,284,000 (threshold: 1,000,000). Driven by code-reviewer batch.', resolved: true },
  { id: 'evt-006', ruleId: 'rule-004', ruleName: 'High Latency', timestamp: '2026-03-08T16:32:18Z', severity: 'info', message: 'Avg latency 5,420ms over 10 min window. security-scanner backlog.', resolved: false },
]

const conditionOptions = [
  { value: 'error_rate', label: 'Error Rate' },
  { value: 'hourly_cost', label: 'Hourly Cost' },
  { value: 'daily_cost', label: 'Daily Cost' },
  { value: 'consecutive_failures', label: 'Consecutive Failures' },
  { value: 'avg_latency', label: 'Avg Latency' },
  { value: 'daily_tokens', label: 'Daily Token Usage' },
]

const channelOptions = [
  { value: 'slack', label: 'Slack Webhook' },
  { value: 'pagerduty', label: 'PagerDuty' },
  { value: 'email', label: 'Email' },
]

const severityStyles = {
  critical: 'bg-red-500/50/10 text-red-500',
  warning: 'bg-amber-500/10 text-amber-600',
  info: 'bg-accent-500/10 text-accent-600',
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>(initialRules)
  const [showForm, setShowForm] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    condition: 'error_rate',
    threshold: '',
    channel: 'slack' as 'slack' | 'pagerduty' | 'email',
    channelTarget: '',
  })

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const addRule = () => {
    if (!newRule.name || !newRule.threshold || !newRule.channelTarget) return
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      ...newRule,
      enabled: true,
    }
    setRules(prev => [...prev, rule])
    setNewRule({ name: '', condition: 'error_rate', threshold: '', channel: 'slack', channelTarget: '' })
    setShowForm(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forge-800">Alerting System</h1>
          <p className="text-forge-500 mt-2">Configure alert rules and view triggered alert history.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium rounded bg-forge-900 text-forge-950 hover:bg-forge-850 transition"
        >
          {showForm ? 'Cancel' : 'New Alert Rule'}
        </button>
      </div>

      {showForm && (
        <div className="bg-forge-50 rounded-md  border border-forge-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-forge-800 mb-5">Create Alert Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g. High Error Rate"
                className="w-full px-3 py-2 border border-forge-200 rounded text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Condition</label>
              <select
                value={newRule.condition}
                onChange={e => setNewRule({ ...newRule, condition: e.target.value })}
                className="w-full px-3 py-2 border border-forge-200 rounded text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition bg-forge-50"
              >
                {conditionOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Threshold</label>
              <input
                type="text"
                value={newRule.threshold}
                onChange={e => setNewRule({ ...newRule, threshold: e.target.value })}
                placeholder="e.g. > 5% or > $25"
                className="w-full px-3 py-2 border border-forge-200 rounded text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Channel</label>
              <select
                value={newRule.channel}
                onChange={e => setNewRule({ ...newRule, channel: e.target.value as 'slack' | 'pagerduty' | 'email' })}
                className="w-full px-3 py-2 border border-forge-200 rounded text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition bg-forge-50"
              >
                {channelOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-forge-600 mb-1">Channel Target</label>
              <input
                type="text"
                value={newRule.channelTarget}
                onChange={e => setNewRule({ ...newRule, channelTarget: e.target.value })}
                placeholder="e.g. #ops-alerts, pd-service-key, or team@company.com"
                className="w-full px-3 py-2 border border-forge-200 rounded text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition"
              />
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={addRule}
              disabled={!newRule.name || !newRule.threshold || !newRule.channelTarget}
              className="px-5 py-2 text-sm font-medium rounded bg-accent-500 text-forge-950 hover:bg-accent-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Rule
            </button>
          </div>
        </div>
      )}

      <div className="bg-forge-50 rounded-md  border border-forge-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-forge-200">
          <h2 className="text-lg font-bold text-forge-800">Alert Rules</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {rules.map(rule => (
            <div key={rule.id} className="px-6 py-4 flex items-center justify-between hover:bg-forge-100 transition">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    rule.enabled ? 'bg-accent-500' : 'bg-forge-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-forge-50 transition-transform ${
                    rule.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`} />
                </button>
                <div>
                  <p className="font-medium text-forge-800 text-sm">{rule.name}</p>
                  <p className="text-xs text-forge-400 mt-0.5">
                    {conditionOptions.find(c => c.value === rule.condition)?.label} {rule.threshold}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-forge-200 text-forge-500">
                  {channelOptions.find(c => c.value === rule.channel)?.label}
                </span>
                <span className="text-xs text-forge-300 max-w-[160px] truncate">{rule.channelTarget}</span>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-forge-300 hover:text-red-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-forge-50 rounded-md  border border-forge-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-forge-200">
          <h2 className="text-lg font-bold text-forge-800">Alert History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {alertHistory.map(evt => (
            <div key={evt.id} className="px-6 py-4 hover:bg-forge-100 transition">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityStyles[evt.severity]}`}>
                    {evt.severity}
                  </span>
                  <span className="text-sm font-semibold text-forge-800">{evt.ruleName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-forge-300">{new Date(evt.timestamp).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    evt.resolved ? 'bg-accent-500/10 text-accent-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {evt.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-forge-500 mt-1">{evt.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
