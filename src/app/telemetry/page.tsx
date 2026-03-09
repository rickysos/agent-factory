'use client'

import { useState } from 'react'

interface ExportLog {
  timestamp: string
  type: 'traces' | 'metrics'
  spanCount: number
  status: 'success' | 'error'
  message: string
}

const sampleExportLogs: ExportLog[] = [
  { timestamp: '2026-03-09T14:30:00Z', type: 'traces', spanCount: 142, status: 'success', message: 'Exported 142 spans to collector' },
  { timestamp: '2026-03-09T14:30:00Z', type: 'metrics', spanCount: 24, status: 'success', message: 'Exported 24 metric data points' },
  { timestamp: '2026-03-09T14:15:00Z', type: 'traces', spanCount: 98, status: 'success', message: 'Exported 98 spans to collector' },
  { timestamp: '2026-03-09T14:15:00Z', type: 'metrics', spanCount: 24, status: 'success', message: 'Exported 24 metric data points' },
  { timestamp: '2026-03-09T14:00:00Z', type: 'traces', spanCount: 0, status: 'error', message: 'Connection refused: collector unreachable' },
  { timestamp: '2026-03-09T13:45:00Z', type: 'traces', spanCount: 87, status: 'success', message: 'Exported 87 spans to collector' },
  { timestamp: '2026-03-09T13:45:00Z', type: 'metrics', spanCount: 24, status: 'success', message: 'Exported 24 metric data points' },
]

export default function TelemetryPage() {
  const [collectorUrl, setCollectorUrl] = useState('http://localhost:4318')
  const [serviceName, setServiceName] = useState('agent-factory')
  const [tracesEnabled, setTracesEnabled] = useState(true)
  const [metricsEnabled, setMetricsEnabled] = useState(true)
  const [saved, setSaved] = useState(false)
  const [exportLogs] = useState<ExportLog[]>(sampleExportLogs)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const lastExport = exportLogs.find(l => l.status === 'success')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">OpenTelemetry Export</h1>
        <p className="text-gray-600 mt-2">Configure OTLP exporter to send traces and metrics to your collector.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Collector Configuration</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collector URL</label>
            <input
              type="text"
              value={collectorUrl}
              onChange={e => setCollectorUrl(e.target.value)}
              placeholder="http://localhost:4318"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">OTLP/HTTP endpoint. Typically port 4318 for HTTP or 4317 for gRPC.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              placeholder="agent-factory"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">Identifies this service in your observability platform.</p>
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setTracesEnabled(!tracesEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  tracesEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tracesEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm font-medium text-gray-700">Export Traces</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setMetricsEnabled(!metricsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  metricsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  metricsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm font-medium text-gray-700">Export Metrics</span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
            >
              Save Configuration
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Configuration saved.</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Export Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
            <p className="text-sm font-semibold text-green-600 mt-1">Connected</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Export</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {lastExport ? new Date(lastExport.timestamp).toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Export Interval</p>
            <p className="text-sm font-medium text-gray-900 mt-1">15 minutes</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Spans</p>
            <p className="text-sm font-medium text-gray-900 mt-1">23</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Export History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Items</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exportLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      log.type === 'traces' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">{log.spanCount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600 text-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
