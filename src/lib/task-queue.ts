import { Task } from './delegation-engine'

export interface QueuedTask extends Task {
  queuePosition: number
  retryCount: number
  maxRetries: number
  timeoutMs: number
  createdAt: Date
  scheduledFor?: Date
}

export interface Worker {
  id: string
  agentId: string
  status: 'idle' | 'working' | 'paused' | 'error'
  currentTaskId?: string
  startedAt?: Date
  lastHeartbeat: Date
  capabilities: string[]
}

export class TaskQueue {
  private tasks: Map<string, QueuedTask> = new Map()
  private workers: Map<string, Worker> = new Map()
  private taskCounter: number = 0

  constructor() {
    // Start heartbeat monitoring
    setInterval(() => this.monitorWorkers(), 30000) // Every 30 seconds
  }

  // Task Management
  public async enqueueTask(task: Task, options: {
    priority?: number
    scheduledFor?: Date
    maxRetries?: number
    timeoutMs?: number
  } = {}): Promise<string> {
    const taskId = `task_${Date.now()}_${++this.taskCounter}`
    
    const queuedTask: QueuedTask = {
      ...task,
      id: taskId,
      queuePosition: this.calculateQueuePosition(task, options.priority),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      timeoutMs: options.timeoutMs || 300000, // 5 minutes default
      createdAt: new Date(),
      scheduledFor: options.scheduledFor,
      status: 'pending'
    }

    this.tasks.set(taskId, queuedTask)
    console.log(`Task "${task.title}" enqueued with ID: ${taskId}`)
    
    // Try to assign immediately if scheduled for now
    if (!options.scheduledFor || options.scheduledFor <= new Date()) {
      this.assignTasks()
    }

    return taskId
  }

  private calculateQueuePosition(task: Task, priority?: number): number {
    // Higher priority = lower queue position (processed first)
    const basePriority = priority || this.getPriorityFromTask(task)
    const timestamp = Date.now()
    
    // Combine priority and timestamp
    return (1000 - basePriority * 100) + (timestamp % 1000)
  }

  private getPriorityFromTask(task: Task): number {
    switch (task.priority) {
      case 'critical': return 5
      case 'high': return 4
      case 'medium': return 3
      case 'low': return 2
      default: return 1
    }
  }

  // Worker Management
  public registerWorker(worker: Omit<Worker, 'id' | 'status' | 'lastHeartbeat'>): string {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newWorker: Worker = {
      ...worker,
      id: workerId,
      status: 'idle',
      lastHeartbeat: new Date()
    }

    this.workers.set(workerId, newWorker)
    console.log(`Worker ${workerId} (${worker.agentId}) registered`)
    
    // Try to assign tasks to new worker
    this.assignTasks()

    return workerId
  }

  public updateWorkerHeartbeat(workerId: string): void {
    const worker = this.workers.get(workerId)
    if (worker) {
      worker.lastHeartbeat = new Date()
    }
  }

  public pauseWorker(workerId: string): void {
    const worker = this.workers.get(workerId)
    if (worker) {
      worker.status = 'paused'
      console.log(`Worker ${workerId} paused`)
    }
  }

  public resumeWorker(workerId: string): void {
    const worker = this.workers.get(workerId)
    if (worker && worker.status === 'paused') {
      worker.status = 'idle'
      console.log(`Worker ${workerId} resumed`)
      this.assignTasks()
    }
  }

  // Task Assignment
  private assignTasks(): void {
    const idleWorkers = Array.from(this.workers.values())
      .filter(w => w.status === 'idle')
      .sort((a, b) => a.lastHeartbeat.getTime() - b.lastHeartbeat.getTime())

    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .filter(t => !t.scheduledFor || t.scheduledFor <= new Date())
      .sort((a, b) => a.queuePosition - b.queuePosition)

    for (const worker of idleWorkers) {
      if (pendingTasks.length === 0) break

      // Find task that matches worker capabilities
      const taskIndex = pendingTasks.findIndex(task => 
        this.taskMatchesWorker(task, worker)
      )

      if (taskIndex !== -1) {
        const task = pendingTasks[taskIndex]
        this.assignTaskToWorker(task.id, worker.id)
        pendingTasks.splice(taskIndex, 1)
      }
    }
  }

  private taskMatchesWorker(task: QueuedTask, worker: Worker): boolean {
    // Simple capability matching - in real implementation, this would be more sophisticated
    const taskCategory = task.category
    const workerAgent = worker.agentId

    // Default delegation rules (similar to OpenClaw orchestrator)
    switch (taskCategory) {
      case 'coding':
        return workerAgent.includes('coder')
      case 'security':
        return workerAgent.includes('security')
      case 'marketing':
        return workerAgent.includes('marketing')
      case 'monitoring':
        return workerAgent.includes('vigil')
      default:
        return workerAgent.includes('coder') // Default to coder
    }
  }

  private assignTaskToWorker(taskId: string, workerId: string): void {
    const task = this.tasks.get(taskId)
    const worker = this.workers.get(workerId)

    if (task && worker) {
      task.status = 'in_progress'
      task.assignedTo = worker.agentId
      task.startedAt = new Date()

      worker.status = 'working'
      worker.currentTaskId = taskId
      worker.startedAt = new Date()

      console.log(`Task "${task.title}" assigned to worker ${workerId} (${worker.agentId})`)

      // Set timeout
      setTimeout(() => {
        this.checkTaskTimeout(taskId)
      }, task.timeoutMs)
    }
  }

  // Task Completion
  public completeTask(taskId: string, result: any): void {
    const task = this.tasks.get(taskId)
    const worker = Array.from(this.workers.values()).find(w => w.currentTaskId === taskId)

    if (task) {
      task.status = 'completed'
      task.completedAt = new Date()
      console.log(`Task "${task.title}" completed with result:`, result)

      if (worker) {
        this.releaseWorker(worker.id)
      }

      // Remove completed task after a delay
      setTimeout(() => {
        this.tasks.delete(taskId)
      }, 60000) // Keep for 1 minute for monitoring
    }
  }

  public failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId)
    const worker = Array.from(this.workers.values()).find(w => w.currentTaskId === taskId)

    if (task) {
      task.retryCount++

      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed'
        console.error(`Task "${task.title}" failed permanently after ${task.maxRetries} retries:`, error)
      } else {
        task.status = 'pending'
        task.assignedTo = undefined
        task.startedAt = undefined
        console.warn(`Task "${task.title}" failed, retry ${task.retryCount}/${task.maxRetries}:`, error)
      }

      if (worker) {
        this.releaseWorker(worker.id)
      }

      if (task.status === 'pending') {
        // Reschedule failed task
        setTimeout(() => this.assignTasks(), 5000)
      }
    }
  }

  private releaseWorker(workerId: string): void {
    const worker = this.workers.get(workerId)
    if (worker) {
      worker.status = 'idle'
      worker.currentTaskId = undefined
      worker.startedAt = undefined
      this.updateWorkerHeartbeat(workerId)
      
      // Assign new tasks
      setTimeout(() => this.assignTasks(), 100)
    }
  }

  // Monitoring
  private checkTaskTimeout(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task && task.status === 'in_progress') {
      console.error(`Task "${task.title}" timed out after ${task.timeoutMs}ms`)
      this.failTask(taskId, `Timeout after ${task.timeoutMs}ms`)
    }
  }

  private monitorWorkers(): void {
    const now = new Date()
    const staleThreshold = 60000 // 1 minute

    for (const [workerId, worker] of this.workers) {
      const timeSinceHeartbeat = now.getTime() - worker.lastHeartbeat.getTime()

      if (timeSinceHeartbeat > staleThreshold) {
        console.warn(`Worker ${workerId} hasn't sent heartbeat in ${timeSinceHeartbeat}ms`)

        if (worker.status === 'working' && worker.currentTaskId) {
          // Worker died while processing task
          this.failTask(worker.currentTaskId, `Worker ${workerId} stopped responding`)
        }

        // Mark worker as error
        worker.status = 'error'
      }
    }
  }

  // Statistics
  public getQueueStats(): {
    totalTasks: number
    pending: number
    inProgress: number
    completed: number
    failed: number
    totalWorkers: number
    idleWorkers: number
    workingWorkers: number
  } {
    let pending = 0
    let inProgress = 0
    let completed = 0
    let failed = 0

    for (const task of this.tasks.values()) {
      switch (task.status) {
        case 'pending': pending++; break
        case 'in_progress': inProgress++; break
        case 'completed': completed++; break
        case 'failed': failed++; break
      }
    }

    const workers = Array.from(this.workers.values())
    const idleWorkers = workers.filter(w => w.status === 'idle').length
    const workingWorkers = workers.filter(w => w.status === 'working').length

    return {
      totalTasks: this.tasks.size,
      pending,
      inProgress,
      completed,
      failed,
      totalWorkers: workers.length,
      idleWorkers,
      workingWorkers
    }
  }

  public getWorkerStats(workerId: string): Worker | undefined {
    return this.workers.get(workerId)
  }

  public getTaskStats(taskId: string): QueuedTask | undefined {
    return this.tasks.get(taskId)
  }
}

// Singleton instance
export const taskQueue = new TaskQueue()