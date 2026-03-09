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

interface EnqueueOptions {
  priority?: number
  scheduledFor?: Date
  maxRetries?: number
  timeoutMs?: number
}

interface QueueStats {
  totalTasks: number
  pending: number
  inProgress: number
  completed: number
  failed: number
  totalWorkers: number
  idleWorkers: number
  workingWorkers: number
}

interface ITaskQueue {
  enqueueTask(task: Task, options?: EnqueueOptions): Promise<string>
  completeTask(taskId: string, result: unknown): void
  failTask(taskId: string, error: string): void
  registerWorker(worker: Omit<Worker, 'id' | 'status' | 'lastHeartbeat'>): string
  updateWorkerHeartbeat(workerId: string): void
  pauseWorker(workerId: string): void
  resumeWorker(workerId: string): void
  getQueueStats(): QueueStats
  getWorkerStats(workerId: string): Worker | undefined
  getTaskStats(taskId: string): QueuedTask | undefined
}

class InMemoryTaskQueue implements ITaskQueue {
  private tasks: Map<string, QueuedTask> = new Map()
  private workers: Map<string, Worker> = new Map()
  private taskCounter = 0

  async enqueueTask(task: Task, options: EnqueueOptions = {}): Promise<string> {
    const taskId = `task_${Date.now()}_${++this.taskCounter}`
    const priority = options.priority || this.getPriority(task)

    const queuedTask: QueuedTask = {
      ...task,
      id: taskId,
      queuePosition: (1000 - priority * 100) + (Date.now() % 1000),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      timeoutMs: options.timeoutMs || 300000,
      createdAt: new Date(),
      scheduledFor: options.scheduledFor,
      status: 'pending',
    }

    this.tasks.set(taskId, queuedTask)

    if (!options.scheduledFor || options.scheduledFor <= new Date()) {
      this.assignTasks()
    }

    return taskId
  }

  private getPriority(task: Task): number {
    switch (task.priority) {
      case 'critical': return 5
      case 'high': return 4
      case 'medium': return 3
      case 'low': return 2
      default: return 1
    }
  }

  registerWorker(worker: Omit<Worker, 'id' | 'status' | 'lastHeartbeat'>): string {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.workers.set(workerId, { ...worker, id: workerId, status: 'idle', lastHeartbeat: new Date() })
    this.assignTasks()
    return workerId
  }

  updateWorkerHeartbeat(workerId: string): void {
    const w = this.workers.get(workerId)
    if (w) w.lastHeartbeat = new Date()
  }

  pauseWorker(workerId: string): void {
    const w = this.workers.get(workerId)
    if (w) w.status = 'paused'
  }

  resumeWorker(workerId: string): void {
    const w = this.workers.get(workerId)
    if (w && w.status === 'paused') {
      w.status = 'idle'
      this.assignTasks()
    }
  }

  private assignTasks(): void {
    const idle = Array.from(this.workers.values()).filter(w => w.status === 'idle')
    const pending = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending' && (!t.scheduledFor || t.scheduledFor <= new Date()))
      .sort((a, b) => a.queuePosition - b.queuePosition)

    for (const worker of idle) {
      const task = pending.shift()
      if (!task) break
      task.status = 'in_progress'
      task.assignedTo = worker.agentId
      task.startedAt = new Date()
      worker.status = 'working'
      worker.currentTaskId = task.id
      worker.startedAt = new Date()

      setTimeout(() => {
        const t = this.tasks.get(task.id)
        if (t && t.status === 'in_progress') {
          this.failTask(task.id, `Timeout after ${task.timeoutMs}ms`)
        }
      }, task.timeoutMs)
    }
  }

  completeTask(taskId: string, _result: unknown): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    task.status = 'completed'
    task.completedAt = new Date()
    const worker = Array.from(this.workers.values()).find(w => w.currentTaskId === taskId)
    if (worker) this.releaseWorker(worker.id)
  }

  failTask(taskId: string, _error: string): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    task.retryCount++
    const worker = Array.from(this.workers.values()).find(w => w.currentTaskId === taskId)
    if (worker) this.releaseWorker(worker.id)

    if (task.retryCount >= task.maxRetries) {
      task.status = 'failed'
    } else {
      task.status = 'pending'
      task.assignedTo = undefined
      task.startedAt = undefined
      setTimeout(() => this.assignTasks(), 5000 * task.retryCount)
    }
  }

  private releaseWorker(workerId: string): void {
    const w = this.workers.get(workerId)
    if (!w) return
    w.status = 'idle'
    w.currentTaskId = undefined
    w.startedAt = undefined
    w.lastHeartbeat = new Date()
    setTimeout(() => this.assignTasks(), 100)
  }

  getQueueStats(): QueueStats {
    let pending = 0, inProgress = 0, completed = 0, failed = 0
    for (const t of this.tasks.values()) {
      if (t.status === 'pending') pending++
      else if (t.status === 'in_progress') inProgress++
      else if (t.status === 'completed') completed++
      else if (t.status === 'failed') failed++
    }
    const workers = Array.from(this.workers.values())
    return {
      totalTasks: this.tasks.size, pending, inProgress, completed, failed,
      totalWorkers: workers.length,
      idleWorkers: workers.filter(w => w.status === 'idle').length,
      workingWorkers: workers.filter(w => w.status === 'working').length,
    }
  }

  getWorkerStats(workerId: string): Worker | undefined {
    return this.workers.get(workerId)
  }

  getTaskStats(taskId: string): QueuedTask | undefined {
    return this.tasks.get(taskId)
  }
}

let _redisQueue: ITaskQueue | null = null

async function createRedisQueue(): Promise<ITaskQueue | null> {
  try {
    const { Queue, Worker: BullWorker } = await import('bullmq')
    const Redis = (await import('ioredis')).default

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true })

    await connection.connect()
    await connection.ping()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queue = new Queue('agent-tasks', { connection: connection as any })
    const workers = new Map<string, Worker>()
    const completedTasks = new Map<string, QueuedTask>()

    const bullWorker = new BullWorker('agent-tasks', async (job) => {
      const task = job.data as QueuedTask
      task.status = 'in_progress'
      task.startedAt = new Date()

      const worker = Array.from(workers.values()).find(w => w.status === 'idle')
      if (worker) {
        worker.status = 'working'
        worker.currentTaskId = task.id
        task.assignedTo = worker.agentId
      }

      return task
    }, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connection: connection as any,
      concurrency: 5,
    })

    bullWorker.on('completed', (job) => {
      const task = job.data as QueuedTask
      task.status = 'completed'
      task.completedAt = new Date()
      completedTasks.set(task.id, task)
      const worker = Array.from(workers.values()).find(w => w.currentTaskId === task.id)
      if (worker) {
        worker.status = 'idle'
        worker.currentTaskId = undefined
      }
    })

    bullWorker.on('failed', (job, err) => {
      if (!job) return
      const task = job.data as QueuedTask
      task.status = 'failed'
      completedTasks.set(task.id, task)
      const worker = Array.from(workers.values()).find(w => w.currentTaskId === task.id)
      if (worker) {
        worker.status = 'idle'
        worker.currentTaskId = undefined
      }
    })

    const redisQueue: ITaskQueue = {
      async enqueueTask(task: Task, options: EnqueueOptions = {}): Promise<string> {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        const priority = options.priority || 3
        const queuedTask: QueuedTask = {
          ...task,
          id: taskId,
          queuePosition: priority,
          retryCount: 0,
          maxRetries: options.maxRetries || 3,
          timeoutMs: options.timeoutMs || 300000,
          createdAt: new Date(),
          scheduledFor: options.scheduledFor,
          status: 'pending',
        }

        const jobOptions: Record<string, unknown> = {
          jobId: taskId,
          priority: 10 - priority,
          attempts: queuedTask.maxRetries,
          backoff: { type: 'exponential', delay: 5000 },
          timeout: queuedTask.timeoutMs,
        }

        if (options.scheduledFor) {
          jobOptions.delay = options.scheduledFor.getTime() - Date.now()
        }

        await queue.add('process-task', queuedTask, jobOptions)
        return taskId
      },

      completeTask(taskId: string, _result: unknown): void {
        completedTasks.set(taskId, {
          id: taskId, title: '', description: '', category: 'general',
          priority: 'medium', estimatedComplexity: 5, status: 'completed',
          createdAt: new Date(), completedAt: new Date(), queuePosition: 0,
          retryCount: 0, maxRetries: 3, timeoutMs: 300000,
        })
      },

      failTask(taskId: string, _error: string): void {
        completedTasks.set(taskId, {
          id: taskId, title: '', description: '', category: 'general',
          priority: 'medium', estimatedComplexity: 5, status: 'failed',
          createdAt: new Date(), queuePosition: 0,
          retryCount: 0, maxRetries: 3, timeoutMs: 300000,
        })
      },

      registerWorker(worker: Omit<Worker, 'id' | 'status' | 'lastHeartbeat'>): string {
        const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        workers.set(workerId, { ...worker, id: workerId, status: 'idle', lastHeartbeat: new Date() })
        return workerId
      },

      updateWorkerHeartbeat(workerId: string): void {
        const w = workers.get(workerId)
        if (w) w.lastHeartbeat = new Date()
      },

      pauseWorker(workerId: string): void {
        const w = workers.get(workerId)
        if (w) w.status = 'paused'
      },

      resumeWorker(workerId: string): void {
        const w = workers.get(workerId)
        if (w && w.status === 'paused') w.status = 'idle'
      },

      getQueueStats(): QueueStats {
        const workerList = Array.from(workers.values())
        let pending = 0, inProgress = 0, completed = 0, failed = 0
        for (const t of completedTasks.values()) {
          if (t.status === 'completed') completed++
          else if (t.status === 'failed') failed++
        }
        for (const w of workerList) {
          if (w.status === 'working') inProgress++
        }
        return {
          totalTasks: completedTasks.size + inProgress + pending,
          pending, inProgress, completed, failed,
          totalWorkers: workerList.length,
          idleWorkers: workerList.filter(w => w.status === 'idle').length,
          workingWorkers: workerList.filter(w => w.status === 'working').length,
        }
      },

      getWorkerStats(workerId: string): Worker | undefined {
        return workers.get(workerId)
      },

      getTaskStats(taskId: string): QueuedTask | undefined {
        return completedTasks.get(taskId)
      },
    }

    console.log('Connected to Redis - using BullMQ task queue')
    return redisQueue
  } catch {
    return null
  }
}

let _taskQueue: ITaskQueue | null = null
const _fallback = new InMemoryTaskQueue()

async function getQueue(): Promise<ITaskQueue> {
  if (_taskQueue) return _taskQueue
  if (_redisQueue === null) {
    _redisQueue = await createRedisQueue()
  }
  if (_redisQueue) {
    _taskQueue = _redisQueue
    return _taskQueue
  }
  console.log('Redis unavailable - using in-memory task queue')
  _taskQueue = _fallback
  return _taskQueue
}

// Export synchronous fallback for existing usage, and async getter for new code
export const taskQueue = _fallback
export { getQueue }
export type { ITaskQueue, EnqueueOptions, QueueStats }
