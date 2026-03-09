'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

interface WorkflowNode {
  id: string
  agentName: string
  x: number
  y: number
}

interface WorkflowEdge {
  id: string
  from: string
  to: string
  condition: string
}

export default function WorkflowsPage() {
  const { agents } = useAgents()
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)

  const addNode = (agentName: string) => {
    const node: WorkflowNode = {
      id: `node_${Date.now()}`,
      agentName,
      x: 200 + Math.random() * 300,
      y: 100 + Math.random() * 200,
    }
    setNodes([...nodes, node])
  }

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (connecting) {
      if (connecting !== nodeId) {
        setEdges([...edges, {
          id: `edge_${Date.now()}`,
          from: connecting,
          to: nodeId,
          condition: 'always',
        }])
      }
      setConnecting(null)
      return
    }
    setSelectedNode(nodeId)
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedNode && dragOffset) {
      setNodes(nodes.map(n =>
        n.id === selectedNode
          ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
          : n
      ))
    }
  }

  const handleMouseUp = () => {
    setSelectedNode(null)
    setDragOffset(null)
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId))
  }

  const deleteEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Editor</h1>
          <p className="text-gray-600 mt-2">
            Drag agents onto the canvas and connect them to define delegation flows.
          </p>
        </div>
        <div className="flex gap-2">
          {connecting && (
            <button
              onClick={() => setConnecting(null)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg"
            >
              Cancel Connect
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Agents</h2>
          <div className="space-y-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => addNode(agent.name)}
                className="w-full text-left p-2 text-sm rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <span className="font-medium">{agent.name}</span>
                <span className="block text-xs text-gray-500">{agent.model}</span>
              </button>
            ))}
            {agents.length === 0 && (
              <p className="text-xs text-gray-400">No agents available. Create agents first.</p>
            )}
          </div>

          {edges.length > 0 && (
            <>
              <h2 className="text-sm font-bold text-gray-900 mb-3 mt-6">Connections</h2>
              <div className="space-y-2">
                {edges.map(edge => {
                  const from = nodes.find(n => n.id === edge.from)
                  const to = nodes.find(n => n.id === edge.to)
                  return (
                    <div key={edge.id} className="flex items-center justify-between p-2 text-xs bg-gray-50 rounded-lg">
                      <span>{from?.agentName} → {to?.agentName}</span>
                      <button onClick={() => deleteEdge(edge.id)} className="text-red-400 hover:text-red-600">x</button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-3">
          <div
            className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200 relative overflow-hidden select-none"
            style={{ height: '600px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map(edge => {
                const from = nodes.find(n => n.id === edge.from)
                const to = nodes.find(n => n.id === edge.to)
                if (!from || !to) return null
                return (
                  <line
                    key={edge.id}
                    x1={from.x + 75}
                    y1={from.y + 30}
                    x2={to.x + 75}
                    y2={to.y + 30}
                    stroke="#6366f1"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {nodes.map(node => (
              <div
                key={node.id}
                className={`absolute px-4 py-3 bg-white rounded-xl border-2 shadow-md cursor-move select-none ${
                  connecting === node.id ? 'border-purple-500 ring-2 ring-purple-200' :
                  selectedNode === node.id ? 'border-blue-500' : 'border-gray-200'
                }`}
                style={{ left: node.x, top: node.y, minWidth: 150 }}
                onMouseDown={e => handleMouseDown(node.id, e)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{node.agentName}</span>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={e => { e.stopPropagation(); setConnecting(node.id) }}
                      className="text-xs text-purple-500 hover:text-purple-700"
                      title="Connect to another node"
                    >
                      &#x2192;
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNode(node.id) }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {nodes.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Click an agent to add it to the canvas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
