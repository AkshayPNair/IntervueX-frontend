"use client"

import { useEffect, useRef } from 'react'
import { getNotificationSocket } from '@/services/notificationSocket'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { toast } from 'sonner'

// Centralized event names to mirror backend NotifyEvents
export const NotifyEvents = {
  SessionBooked: 'notify:session-booked',
  FeedbackSubmitted: 'notify:feedback-submitted',
  RatingSubmitted: 'notify:rating-submitted',
  WalletCredit: 'notify:wallet-credit',
  WalletDebit: 'notify:wallet-debit',
  NewRegistration: 'notify:new-registration',
} as const

type NotifyEventName = typeof NotifyEvents[keyof typeof NotifyEvents]

type Role = 'user' | 'interviewer' | 'admin'

type Listener = (payload: any) => void

export function useNotifications() {
  const user = useSelector((state: RootState) => state.auth.user)
  const socketRef = useRef<ReturnType<typeof getNotificationSocket> | null>(null)

  useEffect(() => {
    if (!user) return
    const baseUrl = process.env.NEXT_PUBLIC_URL as string
    const socket = getNotificationSocket(baseUrl)
    socketRef.current = socket

    // Register into appropriate room(s)
    const role: Role = user.role as Role
    const userId = user.id
    socket.emit('notify:register', { role, userId })

    // Generic helpers
    const on = (event: NotifyEventName, fn: Listener) => socket.on(event, fn)
    const off = (event: NotifyEventName, fn: Listener) => socket.off(event, fn)

    // Handlers (simple toasts; can be replaced with store integration)
    const onSessionBooked: Listener = (p) => {
      if (role === 'interviewer') {
        toast.success('New session booked', { description: `Booking ${p.bookingId} for ${p.date} ${p.startTime}` })
      }
    }

    const onFeedbackSubmitted: Listener = (p) => {
      if (role === 'user') {
        toast.success('Feedback received', { description: `From interviewer ${p.interviewerId}` })
      }
    }

    const onRatingSubmitted: Listener = (p) => {
      if (role === 'interviewer') {
        toast.success('New rating received', { description: `Rating ${p.rating} for booking ${p.bookingId}` })
      }
    }

    const onWalletCredit: Listener = (p) => {
      if (role === 'interviewer' || role === 'admin') {
        toast.success('Wallet credited', { description: `Amount: ${p.amount}` })
      }
    }

    const onWalletDebit: Listener = (p) => {
      if (role === 'user' || role === 'admin') {
        toast.warning('Wallet debited', { description: `Amount: ${p.amount}` })
      }
    }

    const onNewRegistration: Listener = (p) => {
      if (role === 'admin') {
        toast.info('New registration', { description: `${p.role}: ${p.email}` })
      }
    }

    on(NotifyEvents.SessionBooked, onSessionBooked)
    on(NotifyEvents.FeedbackSubmitted, onFeedbackSubmitted)
    on(NotifyEvents.RatingSubmitted, onRatingSubmitted)
    on(NotifyEvents.WalletCredit, onWalletCredit)
    on(NotifyEvents.WalletDebit, onWalletDebit)
    on(NotifyEvents.NewRegistration, onNewRegistration)

    return () => {
      off(NotifyEvents.SessionBooked, onSessionBooked)
      off(NotifyEvents.FeedbackSubmitted, onFeedbackSubmitted)
      off(NotifyEvents.RatingSubmitted, onRatingSubmitted)
      off(NotifyEvents.WalletCredit, onWalletCredit)
      off(NotifyEvents.WalletDebit, onWalletDebit)
      off(NotifyEvents.NewRegistration, onNewRegistration)
      socket.emit('notify:leave', { role, userId })
    }
  }, [user])
}