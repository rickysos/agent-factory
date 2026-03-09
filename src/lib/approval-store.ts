import { eventBus } from './event-bus'

export interface ApprovalRequest {
  id: string
  agentId: string
  sessionId: string
  action: string
  description: string
  risk: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

let approvals: ApprovalRequest[] = []
let nextId = 1

export const approvalStore = {
  createApproval(data: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>): ApprovalRequest {
    const approval: ApprovalRequest = {
      ...data,
      id: String(nextId++),
      status: 'pending',
      createdAt: new Date(),
    }
    approvals.push(approval)
    eventBus.emit('approval:created', approval)
    return approval
  },

  getApproval(id: string): ApprovalRequest | undefined {
    return approvals.find(a => a.id === id)
  },

  getPending(agentId?: string): ApprovalRequest[] {
    return approvals.filter(a => {
      if (a.status !== 'pending') return false
      if (agentId && a.agentId !== agentId) return false
      return true
    })
  },

  resolve(id: string, status: 'approved' | 'rejected', resolvedBy?: string): ApprovalRequest | null {
    const approval = approvals.find(a => a.id === id)
    if (!approval || approval.status !== 'pending') return null
    approval.status = status
    approval.resolvedAt = new Date()
    approval.resolvedBy = resolvedBy
    eventBus.emit('approval:resolved', approval)
    return approval
  },

  getAll(): ApprovalRequest[] {
    return approvals
  },
}
