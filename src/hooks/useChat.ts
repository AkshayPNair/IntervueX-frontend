"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {startOrGetConversation,listConversations,listMessages,markConversationRead,sendMessage} from '@/services/chatService'
import { Conversation, Message } from '@/types/chat.types'
import { getChatSocket } from '@/services/chatSocket'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'


export function useChatConversations(){
    const [items, setItems]=useState<Conversation[]>([])
    const [loading,setLoading]=useState<boolean>(true)
    const [error,setError]=useState<string | null>(null)

    const fetchConversations=useCallback(async()=>{
        setLoading(true)
        setError(null)
        try {
            const data = await listConversations()
            setItems(data)
        } catch (error:any) {
            setError(error?.response?.data?.error || error?.message || 'Failed to load conversations')
        }finally{
            setLoading(false)
        }
    },[])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    return { items, loading, error, refetch: fetchConversations }

}

export function useChatMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [peerTyping, setPeerTyping] = useState<boolean>(false)

  const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const authUser = useSelector((state: RootState) => state.auth.user)
  const selfId = authUser?.id

  // initial load
  useEffect(() => {
    if (!conversationId) return
    let mounted = true
    setLoading(true)
    setError(null)
      listMessages(conversationId)
      .then((data) => {
        if (mounted) setMessages(data.reverse())
      })
      .catch((error: any) => setError(error?.response?.data?.error || error?.message || 'Failed to load messages'))
      .finally(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [conversationId])

  // socket join and listeners
  useEffect(() => {
    if (!conversationId) return
    const baseUrl = process.env.NEXT_PUBLIC_URL as string
    const socket = getChatSocket(baseUrl)
    socketRef.current = socket

    socket.emit('chat:join', { conversationId })

    const onNew = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg])
      }
    }

    const onTyping = (_: any) => {
      // any typing event in this room is from peer
      setPeerTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000)
    }

    const onStopTyping = (_: any) => {
      setPeerTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }

    socket.on('chat:new-message', onNew)
    socket.on('chat:typing', onTyping)
    socket.on('chat:stop-typing', onStopTyping)

    return () => {
      socket.off('chat:new-message', onNew)
      socket.off('chat:typing', onTyping)
      socket.off('chat:stop-typing', onStopTyping)
      socket.emit('chat:leave', { conversationId })
    }
  }, [conversationId])

  const send = useCallback(
    async (recipientId: string, text: string) => {
      if (!conversationId || !text.trim()) return
      const socket = socketRef.current
      if (socket && selfId) {
        // Real-time path: let server save and broadcast
        socket.emit('chat:send', { conversationId, senderId: selfId, recipientId, text })
      } else {
        // Fallback to REST; local append so sender sees immediately
        const saved = await sendMessage(conversationId, recipientId, text)
        setMessages(prev => [...prev, saved])
      }
      // stop typing after sending
      if (socketRef.current) socketRef.current.emit('chat:stop-typing', { conversationId, from: selfId })
    },
    [conversationId, selfId]
  )

  const markRead = useCallback(async () => {
    if (!conversationId) return
    // Prefer socket so peers update instantly, fallback to REST
    if (socketRef.current && selfId) {
      socketRef.current.emit('chat:mark-read', { conversationId, recipientId: selfId })
    } else {
      await markConversationRead(conversationId)
    }
  }, [conversationId, selfId])

  
  const startTyping = useCallback(() => {
    if (!conversationId || !socketRef.current) return
    socketRef.current.emit('chat:typing', { conversationId, from: selfId })
  }, [conversationId, selfId])

  const stopTyping = useCallback(() => {
    if (!conversationId || !socketRef.current) return
    socketRef.current.emit('chat:stop-typing', { conversationId, from: selfId })
  }, [conversationId, selfId])

  return { messages, loading, error, send, setMessages, markRead, peerTyping, startTyping, stopTyping }
}