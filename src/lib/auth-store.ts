import { hashSync, compareSync } from 'bcryptjs'
import crypto from 'crypto'

export type Role = 'admin' | 'operator' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  role: Role
  apiKeys: ApiKey[]
  createdAt: Date
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
  lastUsed?: Date
}

const users: User[] = [
  {
    id: '1',
    email: 'admin@agentfactory.com',
    name: 'Ricky',
    passwordHash: hashSync('admin123', 10),
    role: 'admin',
    apiKeys: [],
    createdAt: new Date('2026-03-01'),
  },
]

let nextId = 2

export const authStore = {
  findByEmail(email: string): User | undefined {
    return users.find(u => u.email === email)
  },

  findById(id: string): User | undefined {
    return users.find(u => u.id === id)
  },

  findByApiKey(key: string): User | undefined {
    return users.find(u => u.apiKeys.some(k => k.key === key))
  },

  createUser(email: string, password: string, name: string, role: Role = 'viewer'): User {
    const user: User = {
      id: String(nextId++),
      email,
      name,
      passwordHash: hashSync(password, 10),
      role,
      apiKeys: [],
      createdAt: new Date(),
    }
    users.push(user)
    return user
  },

  verifyPassword(user: User, password: string): boolean {
    return compareSync(password, user.passwordHash)
  },

  generateApiKey(userId: string, name: string): ApiKey | null {
    const user = users.find(u => u.id === userId)
    if (!user) return null
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      name,
      key: `af_${crypto.randomBytes(32).toString('hex')}`,
      createdAt: new Date(),
    }
    user.apiKeys.push(apiKey)
    return apiKey
  },

  deleteApiKey(userId: string, keyId: string): boolean {
    const user = users.find(u => u.id === userId)
    if (!user) return false
    const len = user.apiKeys.length
    user.apiKeys = user.apiKeys.filter(k => k.id !== keyId)
    return user.apiKeys.length < len
  },

  hasPermission(role: Role, action: string): boolean {
    const permissions: Record<Role, string[]> = {
      admin: ['*'],
      operator: ['agents:read', 'agents:create', 'agents:update', 'agents:deploy', 'tasks:*'],
      viewer: ['agents:read', 'tasks:read'],
    }
    const allowed = permissions[role]
    return allowed.includes('*') || allowed.includes(action) || allowed.some(p => {
      const [resource, perm] = p.split(':')
      const [actionResource] = action.split(':')
      return resource === actionResource && perm === '*'
    })
  },
}
