'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initializeWebSocket(url: string = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:4001') {
  if (socket) return socket

  socket = io(url, {
    transports: ['websocket'],
    autoConnect: false,
  })

  socket.on('connect', () => {
    console.log('WebSocket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  return socket
}

export function getSocket() {
  if (!socket) {
    return initializeWebSocket()
  }
  return socket
}

export function connectWebSocket() {
  const ws = getSocket()
  if (!ws.connected) {
    ws.connect()
  }
  return ws
}

export function disconnectWebSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}

// UI Update Events
export function subscribeToUIUpdates(callback: (data: any) => void) {
  const ws = getSocket()
  ws.on('ui:update', callback)
  return () => ws.off('ui:update', callback)
}

export function subscribeToNotifications(callback: (data: any) => void) {
  const ws = getSocket()
  ws.on('notification:new', callback)
  return () => ws.off('notification:new', callback)
}

export function subscribeToProgress(callback: (data: any) => void) {
  const ws = getSocket()
  ws.on('progress:update', callback)
  return () => ws.off('progress:update', callback)
}

// Feature Flags
export function subscribeToFeatureFlags(callback: (data: any) => void) {
  const ws = getSocket()
  ws.on('feature:toggle', callback)
  return () => ws.off('feature:toggle', callback)
}
