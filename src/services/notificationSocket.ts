import { io, Socket } from 'socket.io-client'

let notifySocket: Socket | null = null

export function getNotificationSocket(baseUrl: string) {
  if (!notifySocket) {
    notifySocket = io(baseUrl, { withCredentials: true, transports: ['websocket'] })
  }
  return notifySocket
}

export function disconnectNotificationSocket() {
  if (notifySocket) {
    notifySocket.disconnect()
    notifySocket = null
  }
}