'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAgents } from '@/lib/agent-context'

type NodeType = 'trigger' | 'agent' | 'condition' | 'output'

interface WorkflowNode {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  config: Record<string, string>
}

interface Connection {
  sourceId: string
  targetId: string
}

interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  connections: Connection[]
}

const NODE_W = 180
const NODE_H = 60
const PORT_R = 6

const nodeColors: Record<NodeType, { border: string; bg: string; darkBg: string }> = {
  trigger:   { border: 'border-l-green-500',  bg: 'bg-accent-500/5',  darkBg: 'dark:bg-accent-900' },
  agent:     { border: 'border-l-blue-500',   bg: 'bg-accent-500/10',   darkBg: 'dark:bg-accent-950' },
  condition: { border: 'border-l-yellow-500', bg: 'bg-amber-500/5', darkBg: 'dark:bg-amber-900' },
  output:    { border: 'border-l-purple-500', bg: 'bg-forge-100', darkBg: 'dark:bg-forge-900' },
}

const nodeTypeLabels: Record<NodeType, string> = {
  trigger: 'Trigger',
  agent: 'Agent',
  condition: 'Condition',
  output: 'Output',
}

const triggerOptions = ['On message', 'On schedule', 'On webhook']
const outputOptions = ['Send message', 'Save to file', 'Call webhook']

function genId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function WorkflowsPage() {
  const { agents } = useAgents()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Dragging existing nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  // Connection drawing
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null

  // --- Drag from sidebar onto canvas ---
  const handleSidebarDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('node-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('node-type') as NodeType
    if (!type) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0
    const x = e.clientX - rect.left + scrollLeft - NODE_W / 2
    const y = e.clientY - rect.top + scrollTop - NODE_H / 2

    const agentId = e.dataTransfer.getData('agent-id')
    const agentName = e.dataTransfer.getData('agent-name')

    const node: WorkflowNode = {
      id: genId(),
      type,
      label: agentName || nodeTypeLabels[type],
      x: Math.max(0, x),
      y: Math.max(0, y),
      config: agentId ? { agentId } : {},
    }
    setNodes(prev => [...prev, node])
    setSelectedNodeId(node.id)
  }

  // --- Drag existing nodes on canvas ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    // Ignore if clicking on ports or buttons
    if ((e.target as HTMLElement).closest('[data-port]') || (e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    e.stopPropagation()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0
    dragOffsetRef.current = {
      x: e.clientX - rect.left + scrollLeft - node.x,
      y: e.clientY - rect.top + scrollTop - node.y,
    }
    setDraggingNodeId(nodeId)
    setSelectedNodeId(nodeId)
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0
    const cx = e.clientX - rect.left + scrollLeft
    const cy = e.clientY - rect.top + scrollTop

    if (connectingFrom) {
      setMousePos({ x: cx, y: cy })
    }

    if (draggingNodeId) {
      const newX = Math.max(0, cx - dragOffsetRef.current.x)
      const newY = Math.max(0, cy - dragOffsetRef.current.y)
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    }
  }, [draggingNodeId, connectingFrom])

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNodeId(null)
  }, [])

  // --- Connections via ports ---
  const handleOutputPortClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    if (connectingFrom === nodeId) {
      setConnectingFrom(null)
      return
    }
    setConnectingFrom(nodeId)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0
    setMousePos({ x: e.clientX - rect.left + scrollLeft, y: e.clientY - rect.top + scrollTop })
  }

  const handleInputPortClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    if (!connectingFrom || connectingFrom === nodeId) return
    const exists = connections.some(c => c.sourceId === connectingFrom && c.targetId === nodeId)
    if (!exists) {
      setConnections(prev => [...prev, { sourceId: connectingFrom, targetId: nodeId }])
    }
    setConnectingFrom(null)
  }

  const handleCanvasClick = () => {
    if (connectingFrom) {
      setConnectingFrom(null)
    } else {
      setSelectedNodeId(null)
    }
  }

  // --- Node config updates ---
  const updateNodeConfig = (key: string, value: string) => {
    if (!selectedNodeId) return
    setNodes(prev => prev.map(n =>
      n.id === selectedNodeId ? { ...n, config: { ...n.config, [key]: value } } : n
    ))
  }

  const updateNodeLabel = (label: string) => {
    if (!selectedNodeId) return
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, label } : n))
  }

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }

  const deleteConnection = (sourceId: string, targetId: string) => {
    setConnections(prev => prev.filter(c => !(c.sourceId === sourceId && c.targetId === targetId)))
  }

  // --- Save / Load / Clear ---
  const saveWorkflow = () => {
    const workflow: Workflow = {
      id: 'wf_1',
      name: workflowName,
      nodes,
      connections,
    }
    localStorage.setItem('agent-factory-workflow', JSON.stringify(workflow))
  }

  const loadWorkflow = () => {
    const raw = localStorage.getItem('agent-factory-workflow')
    if (!raw) return
    try {
      const wf: Workflow = JSON.parse(raw)
      setWorkflowName(wf.name)
      setNodes(wf.nodes)
      setConnections(wf.connections)
      setSelectedNodeId(null)
      setConnectingFrom(null)
    } catch { /* ignore */ }
  }

  const clearWorkflow = () => {
    setNodes([])
    setConnections([])
    setSelectedNodeId(null)
    setConnectingFrom(null)
    setWorkflowName('Untitled Workflow')
  }

  // Load on mount
  useEffect(() => {
    loadWorkflow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- SVG path helpers ---
  const getOutputPortPos = (node: WorkflowNode) => ({ x: node.x + NODE_W, y: node.y + NODE_H / 2 })
  const getInputPortPos = (node: WorkflowNode) => ({ x: node.x, y: node.y + NODE_H / 2 })

  const makePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
  }

  // --- Sidebar node type palette ---
  const nodeTypePalette: { type: NodeType; desc: string }[] = [
    { type: 'trigger', desc: 'Entry point for the workflow' },
    { type: 'agent', desc: 'Assign an AI agent to this step' },
    { type: 'condition', desc: 'Branch based on a condition' },
    { type: 'output', desc: 'Send result somewhere' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <h1 className="sr-only">Workflow Editor</h1>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-forge-50 dark:bg-forge-900 border-b border-forge-200 dark:border-forge-700 shrink-0">
        <input
          type="text"
          value={workflowName}
          onChange={e => setWorkflowName(e.target.value)}
          className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-forge-200 dark:hover:border-forge-600 focus:border-accent-500 focus:outline-none px-1 py-0.5 text-forge-800 dark:text-forge-100"
        />
        <div className="flex-1" />
        <button
          onClick={saveWorkflow}
          className="px-3 py-1.5 text-sm font-medium bg-accent-500 text-forge-950 rounded hover:bg-accent-400 transition"
        >
          Save
        </button>
        <button
          onClick={loadWorkflow}
          className="px-3 py-1.5 text-sm font-medium bg-forge-200 dark:bg-forge-700 text-forge-600 dark:text-forge-200 rounded hover:bg-forge-300 dark:hover:bg-forge-600 transition"
        >
          Load
        </button>
        <button
          onClick={clearWorkflow}
          className="px-3 py-1.5 text-sm font-medium bg-red-500/50/10 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-500/50/15 dark:hover:bg-red-700 transition"
        >
          Clear
        </button>
        {connectingFrom && (
          <span className="text-xs text-forge-500 dark:text-forge-400 ml-2">
            Click an input port to connect...
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto relative cursor-crosshair"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onClick={handleCanvasClick}
          style={{
            backgroundImage:
              'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div style={{ width: 3000, height: 2000, position: 'relative' }}>
            {/* SVG layer for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-indigo-500 dark:fill-indigo-400" />
                </marker>
              </defs>
              {connections.map((conn) => {
                const src = nodes.find(n => n.id === conn.sourceId)
                const tgt = nodes.find(n => n.id === conn.targetId)
                if (!src || !tgt) return null
                const p1 = getOutputPortPos(src)
                const p2 = getInputPortPos(tgt)
                return (
                  <g key={`${conn.sourceId}-${conn.targetId}`}>
                    <path
                      d={makePath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      className="stroke-indigo-500 dark:stroke-indigo-400"
                      strokeWidth={2}
                      markerEnd="url(#arrow)"
                    />
                    {/* Invisible wider path for click target */}
                    <path
                      d={makePath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={12}
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConnection(conn.sourceId, conn.targetId)
                      }}
                    />
                  </g>
                )
              })}
              {/* Live connection line */}
              {connectingFrom && (() => {
                const src = nodes.find(n => n.id === connectingFrom)
                if (!src) return null
                const p1 = getOutputPortPos(src)
                return (
                  <path
                    d={makePath(p1.x, p1.y, mousePos.x, mousePos.y)}
                    fill="none"
                    className="stroke-purple-400 dark:stroke-purple-300"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                  />
                )
              })()}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const colors = nodeColors[node.type]
              const isSelected = selectedNodeId === node.id
              return (
                <div
                  key={node.id}
                  className={`absolute flex items-center rounded border-l-4 ${colors.border} ${colors.bg} ${colors.darkBg} border border-forge-200 dark:border-forge-700  select-none ${
                    isSelected ? 'ring-2 ring-accent-500 dark:ring-blue-400' : ''
                  } ${draggingNodeId === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: NODE_W,
                    height: NODE_H,
                    zIndex: isSelected ? 10 : 2,
                  }}
                  onMouseDown={e => handleNodeMouseDown(e, node.id)}
                  onClick={e => { e.stopPropagation(); setSelectedNodeId(node.id) }}
                >
                  {/* Input port */}
                  <div
                    data-port="input"
                    className={`absolute rounded-full border-2 border-forge-400 dark:border-forge-500 bg-forge-50 dark:bg-forge-850 hover:border-accent-500 hover:bg-accent-500/10 dark:hover:bg-accent-900 transition cursor-pointer ${
                      connectingFrom ? 'scale-125' : ''
                    }`}
                    style={{ width: PORT_R * 2, height: PORT_R * 2, left: -PORT_R, top: NODE_H / 2 - PORT_R }}
                    onClick={e => handleInputPortClick(e, node.id)}
                  />
                  {/* Node content */}
                  <div className="flex-1 px-3 py-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-forge-300 dark:text-forge-400">
                      {nodeTypeLabels[node.type]}
                    </div>
                    <div className="text-sm font-medium text-forge-800 dark:text-forge-100 truncate">
                      {node.label}
                    </div>
                  </div>
                  {/* Output port */}
                  <div
                    data-port="output"
                    className={`absolute rounded-full border-2 border-forge-400 dark:border-forge-500 bg-forge-50 dark:bg-forge-850 hover:border-accent-500 hover:bg-accent-500/10 dark:hover:bg-accent-900 transition cursor-pointer ${
                      connectingFrom === node.id ? 'bg-forge-300 dark:bg-forge-600 border-purple-500' : ''
                    }`}
                    style={{ width: PORT_R * 2, height: PORT_R * 2, right: -PORT_R, top: NODE_H / 2 - PORT_R }}
                    onClick={e => handleOutputPortClick(e, node.id)}
                  />
                </div>
              )
            })}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-forge-300 dark:text-forge-500 text-lg">
                  Drag node types from the sidebar onto the canvas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[300px] shrink-0 bg-forge-50 dark:bg-forge-900 border-l border-forge-200 dark:border-forge-700 overflow-y-auto">
          {selectedNode ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-forge-800 dark:text-forge-100">Node Config</h3>
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Delete
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={e => updateNodeLabel(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-forge-200 dark:border-forge-700 rounded bg-forge-50 dark:bg-forge-850 text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Type</label>
                <div className={`text-sm px-2 py-1.5 rounded ${nodeColors[selectedNode.type].bg} ${nodeColors[selectedNode.type].darkBg} ${nodeColors[selectedNode.type].border} border-l-4`}>
                  {nodeTypeLabels[selectedNode.type]}
                </div>
              </div>

              {/* Type-specific config */}
              {selectedNode.type === 'trigger' && (
                <div>
                  <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Trigger Type</label>
                  <select
                    value={selectedNode.config.triggerType || ''}
                    onChange={e => updateNodeConfig('triggerType', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-forge-200 dark:border-forge-700 rounded bg-forge-50 dark:bg-forge-850 text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="">Select...</option>
                    {triggerOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {selectedNode.type === 'agent' && (
                <div>
                  <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Agent</label>
                  <select
                    value={selectedNode.config.agentId || ''}
                    onChange={e => {
                      const agent = agents.find(a => a.id === e.target.value)
                      updateNodeConfig('agentId', e.target.value)
                      if (agent) updateNodeLabel(agent.name)
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-forge-200 dark:border-forge-700 rounded bg-forge-50 dark:bg-forge-850 text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="">Select agent...</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.model})</option>)}
                  </select>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div>
                  <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Condition</label>
                  <input
                    type="text"
                    placeholder='e.g. sentiment > 0.5'
                    value={selectedNode.config.expression || ''}
                    onChange={e => updateNodeConfig('expression', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-forge-200 dark:border-forge-700 rounded bg-forge-50 dark:bg-forge-850 text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>
              )}

              {selectedNode.type === 'output' && (
                <div>
                  <label className="block text-xs font-medium text-forge-400 dark:text-forge-500 mb-1">Output Type</label>
                  <select
                    value={selectedNode.config.outputType || ''}
                    onChange={e => updateNodeConfig('outputType', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-forge-200 dark:border-forge-700 rounded bg-forge-50 dark:bg-forge-850 text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  >
                    <option value="">Select...</option>
                    {outputOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {/* Position */}
              <div className="text-xs text-forge-300 dark:text-forge-400 pt-2 border-t border-forge-200 dark:border-forge-700">
                Position: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})
              </div>

              {/* Connections from/to this node */}
              {(() => {
                const outgoing = connections.filter(c => c.sourceId === selectedNode.id)
                const incoming = connections.filter(c => c.targetId === selectedNode.id)
                if (outgoing.length === 0 && incoming.length === 0) return null
                return (
                  <div className="pt-2 border-t border-forge-200 dark:border-forge-700 space-y-1">
                    <label className="block text-xs font-medium text-forge-400 dark:text-forge-500">Connections</label>
                    {incoming.map(c => {
                      const src = nodes.find(n => n.id === c.sourceId)
                      return (
                        <div key={c.sourceId} className="flex items-center justify-between text-xs text-forge-500 dark:text-forge-400">
                          <span>{src?.label} &rarr; this</span>
                          <button onClick={() => deleteConnection(c.sourceId, c.targetId)} className="text-red-400 hover:text-red-600">x</button>
                        </div>
                      )
                    })}
                    {outgoing.map(c => {
                      const tgt = nodes.find(n => n.id === c.targetId)
                      return (
                        <div key={c.targetId} className="flex items-center justify-between text-xs text-forge-500 dark:text-forge-400">
                          <span>this &rarr; {tgt?.label}</span>
                          <button onClick={() => deleteConnection(c.sourceId, c.targetId)} className="text-red-400 hover:text-red-600">x</button>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-forge-800 dark:text-forge-100">Node Types</h3>
              <p className="text-xs text-forge-400 dark:text-forge-500">Drag onto the canvas to add</p>
              {nodeTypePalette.map(item => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={e => handleSidebarDragStart(e, item.type)}
                  className={`p-3 rounded border-l-4 ${nodeColors[item.type].border} ${nodeColors[item.type].bg} ${nodeColors[item.type].darkBg} border border-forge-200 dark:border-forge-700 cursor-grab hover: transition select-none`}
                >
                  <div className="text-sm font-semibold text-forge-800 dark:text-forge-100">{nodeTypeLabels[item.type]}</div>
                  <div className="text-xs text-forge-400 dark:text-forge-500">{item.desc}</div>
                </div>
              ))}

              {agents.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-forge-800 dark:text-forge-100 pt-2">Quick Add Agent</h3>
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('node-type', 'agent')
                        e.dataTransfer.setData('agent-id', agent.id)
                        e.dataTransfer.setData('agent-name', agent.name)
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                      className={`p-2 rounded border-l-4 ${nodeColors.agent.border} ${nodeColors.agent.bg} ${nodeColors.agent.darkBg} border border-forge-200 dark:border-forge-700 cursor-grab hover: transition select-none`}
                    >
                      <div className="text-sm font-medium text-forge-800 dark:text-forge-100">{agent.name}</div>
                      <div className="text-xs text-forge-400 dark:text-forge-500">{agent.model}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
