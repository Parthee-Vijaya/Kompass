import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  connect() {
    if (this.socket?.connected) return

    this.socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })

    this.socket.on('routes-updated', (data) => {
      this.emit('routes-updated', data)
    })

    this.socket.on('assignment-changed', (data) => {
      this.emit('assignment-changed', data)
    })

    this.socket.on('employee-status-changed', (data) => {
      this.emit('employee-status-changed', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinTeam(teamId: string) {
    this.socket?.emit('join-team', teamId)
  }

  leaveTeam(teamId: string) {
    this.socket?.emit('leave-team', teamId)
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in WebSocket listener for ${event}:`, error)
      }
    })
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const wsService = new WebSocketService()
