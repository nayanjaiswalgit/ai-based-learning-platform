'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { connectWebSocket, disconnectWebSocket, getSocket } from '@/lib/websocket'
import type { Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
})

export function useWebSocket() {
  return useContext(WebSocketContext)
}

interface WebSocketProviderProps {
  children: ReactNode
  autoConnect?: boolean
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (autoConnect) {
      const ws = connectWebSocket()
      setSocket(ws)

      ws.on('connect', () => setIsConnected(true))
      ws.on('disconnect', () => setIsConnected(false))

      return () => {
        disconnectWebSocket()
      }
    }
  }, [autoConnect])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook for real-time UI updates
export function useRealtimeUI() {
  const { socket, isConnected } = useWebSocket()
  const [uiConfig, setUIConfig] = useState<any>(null)

  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on('ui:update', (data) => {
      setUIConfig(data)
    })

    return () => {
      socket.off('ui:update')
    }
  }, [socket, isConnected])

  return { uiConfig, isConnected }
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const { socket, isConnected } = useWebSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!socket || !isConnected) return

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev])
    })

    return () => {
      socket.off('notification:new')
    }
  }, [socket, isConnected])

  return { notifications, isConnected }
}
