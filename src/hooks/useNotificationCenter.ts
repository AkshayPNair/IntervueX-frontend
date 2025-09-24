"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getNotificationSocket } from "@/services/notificationSocket"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { toast } from "sonner"
import { NotifyEvents } from "./useNotification"

export type NotificationItem = {
  id: string
  type: keyof typeof NotifyEvents | "custom"
  title: string
  description?: string
  timestamp: number
  read: boolean
}

const STORAGE_KEY = "notification_center_items"

type Role = "user" | "interviewer" | "admin"

type Listener = (payload: any) => void

export function useNotificationCenter() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [items, setItems] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [open, setOpen] = useState(false)
  const socketRef = useRef<ReturnType<typeof getNotificationSocket> | null>(null)



  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  // Socket listeners
  useEffect(() => {
    if (!user) return
    const baseUrl = process.env.NEXT_PUBLIC_URL as string
    const socket = getNotificationSocket(baseUrl)
    socketRef.current = socket

    const role: Role = user.role as Role
    const userId = (user as any)?.id ?? (user as any)?._id

    if (!userId && role !== "admin") {
      console.warn("[notifications] Missing userId for role:", role, user)
    }

    socket.on("connect", () => console.log("[notifications] connected:", socket.id))
    socket.on("connect_error", (err: any) => console.error("[notifications] connect_error:", err))
    socket.on("notify:registered", (p: any) => console.log("[notifications] registered:", p))
    socket.on("notify:error", (p: any) => console.error("[notifications] error:", p))

    socket.emit("notify:register", { role, userId })

    const add = (item: NotificationItem) => setItems((prev) => [item, ...prev])

    const makeId = (type: string) => `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`

    const onSessionBooked: Listener = (p) => {
      if (role === "interviewer") {
        const name = p?.userName || p?.userId
        add({
          id: makeId(NotifyEvents.SessionBooked),
          type: "SessionBooked",
          title: "New session booked",
          description: name ? `Booked by ${name} on ${p.date} ${p.startTime}` : `Booking ${p.bookingId} on ${p.date} ${p.startTime}`,
          timestamp: Date.now(),
          read: false,
        })
        toast.success("New session booked", { description: name ? `Booked by ${name}` : `Booking ${p.bookingId}` })
      }
    }

    const onFeedbackSubmitted: Listener = (p) => {
      if (role === "user") {
        const interviewer = p?.interviewerName || p?.interviewerId
        add({
          id: makeId(NotifyEvents.FeedbackSubmitted),
          type: "FeedbackSubmitted",
          title: "Feedback received",
          description: `From interviewer ${interviewer}`,
          timestamp: Date.now(),
          read: false,
        })
        toast.success("Feedback received", { description: `From interviewer ${interviewer}` })
      }
    }

    const onRatingSubmitted: Listener = (p) => {
      if (role === "interviewer") {
        const user = p?.userName || p?.userId
        add({
          id: makeId(NotifyEvents.RatingSubmitted),
          type: "RatingSubmitted",
          title: "New rating received",
           description: `Rating ${p.rating} from ${user}`,
          timestamp: Date.now(),
          read: false,
        })
        toast.success("New rating received", { description: `Rating ${p.rating} from ${user}` })
      }
    }

    const onWalletCredit: Listener = (p) => {
      if (role === "interviewer" || role === "admin") {
        const user = p?.userName || p?.userId
        const description = role === "admin"
          ? `User: ${user} • Amount: ${p.amount}`
          : `Amount: ${p.amount}`
        add({
          id: makeId(NotifyEvents.WalletCredit),
          type: "WalletCredit",
          title: "Wallet credited",
           description,
          timestamp: Date.now(),
          read: false,
        })
        toast.success("Wallet credited", { description })
      }
    }

    const onWalletDebit: Listener = (p) => {
      if (role === "user" || role === "admin") {
        const interviewer = p?.interviewerName || p?.interviewerId
        const description = role === "admin"
          ? `Interviewer: ${interviewer} • Amount: ${p.amount}`
          : `Amount: ${p.amount}`
        add({
          id: makeId(NotifyEvents.WalletDebit),
          type: "WalletDebit",
          title: "Wallet debited",
           description,
          timestamp: Date.now(),
          read: false,
        })
        toast.warning("Wallet debited", { description })
      }
    }

    const onNewRegistration: Listener = (p) => {
      if (role === "admin") {
        add({
          id: makeId(NotifyEvents.NewRegistration),
          type: "NewRegistration",
          title: "New registration",
          description: `${p.role}: ${p.email}`,
          timestamp: Date.now(),
          read: false,
        })
        toast.info("New registration", { description: `${p.role}: ${p.email}` })
      }
    }

    const on = (event: string, fn: Listener) => socket.on(event, fn)
    const off = (event: string, fn: Listener) => socket.off(event, fn)

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
      socket.emit("notify:leave", { role, userId })
    }
  }, [user])

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items])

  const clearAll = () => setItems([])
  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })))

  // Mark as read when popover opens
  useEffect(() => {
    if (open && unreadCount > 0) markAllRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return {
    items,
    unreadCount,
    clearAll,
    markAllRead,
    open,
    setOpen,
  }
}