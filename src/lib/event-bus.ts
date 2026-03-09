type EventHandler = (data: unknown) => void

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach(handler => handler(data))
    this.listeners.get('*')?.forEach(handler => handler({ event, data }))
  }
}

export const eventBus = new EventBus()
