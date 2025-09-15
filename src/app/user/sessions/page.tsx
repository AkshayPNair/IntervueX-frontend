"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { useUserBookings } from "@/hooks/useUserBookings"
import { useCancelBooking } from "@/hooks/useCancelBooking"
import { useInterviewerRatingByBookingId } from "@/hooks/useInterviewerRatingByBookingId"
import { BookingStatus, Booking } from "@/types/booking.types"
import { Textarea } from "@/components/ui/textarea"
import Paginator from "../../../components/ui/paginator";
import { toast } from "sonner"
import {
  Play,
  Calendar,
  Video,
  Star,
  Clock,
  User,
  MessageSquare,
  Plus,
  X,
  AlertTriangle,
  Eye,
  CreditCard,
  Hash
} from "lucide-react"

const getExperienceLevel = (years?: number): string => {
  if (!years) return "Junior"
  if (years > 6) return "Expert"
  if (years > 3) return "Senior"
  return "Junior"
}

const BookingRatingStars=({ bookingId }: { bookingId: string })=> {
  const { data } = useInterviewerRatingByBookingId(bookingId)
  const rating = data?.rating ?? 0
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-[#3FB950] text-[#3FB950]' : 'text-[#30363D]'}`}
        />
      ))}
    </div>
  )
}

const formatDateTime = (date: string, startTime: string): string => {
  const sessionDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())

  if (sessionDateOnly.getTime() === todayOnly.getTime()) {
    return `Today, ${startTime}`
  } else if (sessionDateOnly.getTime() === tomorrowOnly.getTime()) {
    return `Tomorrow, ${startTime}`
  } else {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${sessionDate.toLocaleDateString('en-US', options)}, ${startTime}`
  }
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const canCancelBooking = (date: string, startTime: string): boolean => {
  const bookingDateTime = new Date(`${date}T${startTime}`)
  const now = new Date()
  const timeDifference = bookingDateTime.getTime() - now.getTime()
  const hoursUntilBooking = timeDifference / (1000 * 60 * 60)
  return hoursUntilBooking >= 24
}

export default function SessionsPage() {
  const router = useRouter()
  const [sessionsTab, setSessionsTab] = useState("upcoming")
  const { bookings, loading, error, refetch } = useUserBookings()
  const { cancelSession, loading: cancelLoading } = useCancelBooking()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedCancelledBooking, setSelectedCancelledBooking] = useState<Booking | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null)
  const { data: reviewData, loading: reviewLoading, error: reviewError } = useInterviewerRatingByBookingId(selectedBookingForReview?.id ?? null)
  
  const pageSize = 6
  const [pageUpcoming, setPageUpcoming] = useState(1)
  const [pageCompleted, setPageCompleted] = useState(1)
  const [pageCancelled, setPageCancelled] = useState(1)

  const upcomingBookings = useMemo(() => bookings.filter(booking =>
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
  ), [bookings])

  const completedBookings = useMemo(() => bookings.filter(booking =>
    booking.status === BookingStatus.COMPLETED
  ), [bookings])

  const cancelledBookings = bookings.filter(booking =>
    booking.status === BookingStatus.CANCELLED
  )

  const pagedUpcoming = useMemo(() => {
    const start = (pageUpcoming - 1) * pageSize
    return upcomingBookings.slice(start, start + pageSize)
  }, [upcomingBookings, pageUpcoming])

  const pagedCompleted = useMemo(() => {
    const start = (pageCompleted - 1) * pageSize
    return completedBookings.slice(start, start + pageSize)
  }, [completedBookings, pageCompleted])

  const pagedCancelled = useMemo(() => {
    const start = (pageCancelled - 1) * pageSize
    return cancelledBookings.slice(start, start + pageSize)
  }, [cancelledBookings, pageCancelled])

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancelModalOpen(true)
    setCancelReason('')
    setCancelError('')
  }

  const handleReviewClick = (booking: Booking) => {
    setSelectedBookingForReview(booking)
    setReviewModalOpen(true)
  }

  const handleReviewModalClose = () => {
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return

    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for cancellation')
      return
    }
    if (cancelReason.trim().length < 10) {
      setCancelError('Please provide a more detailed reason (at least 10 characters)')
      return
    }

    setCancelError('')

    try {
      await cancelSession({
        bookingId: selectedBooking.id,
        reason: cancelReason.trim()
      })

      toast.success('Session cancelled successfully')
      setCancelModalOpen(false)
      setSelectedBooking(null)
      setCancelReason('')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel session')
    }
  }

  const handleCancelModalClose = () => {
    if (!cancelLoading) {
      setCancelModalOpen(false)
      setSelectedBooking(null)
      setCancelReason('')
      setCancelError('')
    }
  }

  const handleDetailsClick = (booking: Booking) => {
    setSelectedCancelledBooking(booking)
    setDetailsModalOpen(true)
  }

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false)
    setSelectedCancelledBooking(null)
  }

  const commonReasons = [
    "Personal emergency or urgent matter",
    "Technical issues or equipment problems",
    "Need to better preparation time",
    "Health-related concerns"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">

      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Sessions Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Interview Sessions</h1>
                <p className="text-[#7D8590] text-lg">Manage your interview sessions</p>
              </div>

            </div>
          </div>
        </div>

        {/* Sessions Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#E6EDF3]">Your Sessions</h2>
            </div>

            {/* Sliding Toggle Buttons */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-[#0D1117]/80 rounded-xl p-1 backdrop-blur-sm border border-[#30363D]">
                <motion.button
                  onClick={() => { setSessionsTab("upcoming"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${sessionsTab === "upcoming"
                    ? "bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg"
                    : "text-[#7D8590] hover:text-[#E6EDF3]"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upcoming
                </motion.button>
                <motion.button
                  onClick={() => { setSessionsTab("completed"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${sessionsTab === "completed"
                    ? "bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg"
                    : "text-[#7D8590] hover:text-[#E6EDF3]"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Completed
                </motion.button>
                <motion.button
                  onClick={() => { setSessionsTab("cancelled"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${sessionsTab === "cancelled"
                    ? "bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg"
                    : "text-[#7D8590] hover:text-[#E6EDF3]"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelled
                </motion.button>
              </div>
            </div>

            {/* Sessions Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={sessionsTab}
                initial={{ opacity: 0, x: sessionsTab === "upcoming" ? -20 : sessionsTab === "completed" ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: sessionsTab === "upcoming" ? 20 : sessionsTab === "completed" ? 0 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {sessionsTab === "upcoming" ? (
                  <>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BC8CFF] mx-auto"></div>
                          <p className="text-[#7D8590] mt-2">Loading sessions...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <div className="text-red-500 mb-4">Error: {error}</div>
                          <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : upcomingBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 text-[#7D8590] mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-[#E6EDF3] mb-2">No Upcoming Sessions</h3>
                          <p className="text-[#7D8590] mb-6">You don't have any scheduled interview sessions yet.</p>
                        </div>
                      ) : (
                        pagedUpcoming.map((booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-16 h-16">
                                      {booking.interviewerProfilePicture ? (
                                        <AvatarImage src={booking.interviewerProfilePicture} alt={booking.interviewerName} />
                                      ) : null}
                                      <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold text-lg">
                                        {getInitials(booking.interviewerName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-[#E6EDF3] font-bold text-xl">{booking.interviewerName}</h3>
                                      <div className="flex items-center space-x-3 text-sm mb-2">
                                        <span className="text-[#BC8CFF] font-medium">{booking.interviewerJobTitle || 'Software Engineer'}</span>
                                        <Badge variant="outline" className="border-[#58A6FF] text-[#58A6FF]">
                                          {getExperienceLevel(booking.interviewerExperience)}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-[#7D8590]">
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {formatDateTime(booking.date, booking.startTime)}
                                        </span>
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          Mock Interview
                                        </span>
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          60 min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">

                                    <Button asChild
                                      className="bg-gradient-to-r from-[#3FB950] to-[#2EA043] hover:from-[#3FB950]/80 hover:to-[#2EA043]/80 px-6"
                                    >
                                      <Link href={`/user/sessions/${booking.id}`}>
                                        <Video className="w-4 h-4 mr-2" />
                                        Join Meeting
                                      </Link>
                                    </Button>
                                    <Button
                                      onClick={() => handleDetailsClick(booking)}
                                      variant="outline"
                                      className="border-[#BC8CFF]/50 text-[#BC8CFF] hover:bg-[#BC8CFF]/10 hover:border-[#BC8CFF] bg-transparent"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Details
                                    </Button>
                                    {canCancelBooking(booking.date, booking.startTime) && (
                                      <Button
                                        onClick={() => handleCancelClick(booking)}
                                        variant="outline"
                                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 bg-transparent"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                    {/* Pagination - Upcoming */}
                    {!loading && upcomingBookings.length > 0 && (
                      <div className="mt-6 flex justify-center">
                        <Paginator
                          page={pageUpcoming}
                          totalItems={upcomingBookings.length}
                          pageSize={pageSize}
                          onPageChange={(p) => { setPageUpcoming(p); setPageCompleted(1); setPageCancelled(1); }}
                        />
                      </div>
                    )}
                  </>
                ) : sessionsTab === "completed" ? (
                  <>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BC8CFF] mx-auto"></div>
                          <p className="text-[#7D8590] mt-2">Loading sessions...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <div className="text-red-500 mb-4">Error: {error}</div>
                          <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : completedBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-[#7D8590] mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-[#E6EDF3] mb-2">No Completed Sessions</h3>
                          <p className="text-[#7D8590] mb-6">You haven't completed any interview sessions yet.</p>
                        </div>
                      ) : (
                        pagedCompleted.map((booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-16 h-16">
                                      {booking.interviewerProfilePicture ? (
                                        <AvatarImage src={booking.interviewerProfilePicture} alt={booking.interviewerName} />
                                      ) : null}
                                      <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold text-lg">
                                        {getInitials(booking.interviewerName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-[#E6EDF3] font-bold text-xl">{booking.interviewerName}</h3>
                                      <div className="flex items-center space-x-3 text-sm mb-2">
                                        <span className="text-[#BC8CFF] font-medium">{booking.interviewerJobTitle || 'Software Engineer'}</span>
                                        <Badge variant="outline" className="border-[#58A6FF] text-[#58A6FF]">
                                          {getExperienceLevel(booking.interviewerExperience)}
                                        </Badge>
                                        <BookingRatingStars bookingId={booking.id} />
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-[#7D8590]">
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {formatDateTime(booking.date, booking.startTime)}
                                        </span>
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          Mock Interview
                                        </span>
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          60 min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <Button
                                      onClick={() => router.push(`/user/feedback`)}
                                      className="bg-gradient-to-r from-[#58A6FF] to-[#0969DA] hover:from-[#58A6FF]/80 hover:to-[#0969DA]/80 px-6"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      View Feedback
                                    </Button>
                                    <Button
                                      onClick={() => handleDetailsClick(booking)}
                                      variant="outline"
                                      className="border-[#BC8CFF]/50 text-[#BC8CFF] hover:bg-[#BC8CFF]/10 hover:border-[#BC8CFF] bg-transparent"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Details
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10"
                                      onClick={() => handleReviewClick(booking)}
                                    >
                                      Review
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                    {!loading && completedBookings.length > 0 && (
                      <div className="mt-6 flex justify-center">
                        <Paginator
                          page={pageCompleted}
                          totalItems={completedBookings.length}
                          pageSize={pageSize}
                          onPageChange={(p) => { setPageCompleted(p); setPageUpcoming(1); setPageCancelled(1); }}
                        />
                      </div>
                    )}
                  </>
                ) : sessionsTab === "cancelled" ? (
                  <>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BC8CFF] mx-auto"></div>
                          <p className="text-[#7D8590] mt-2">Loading sessions...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <div className="text-red-500 mb-4">Error: {error}</div>
                          <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : cancelledBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <X className="w-16 h-16 text-[#7D8590] mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-[#E6EDF3] mb-2">No Cancelled Sessions</h3>
                          <p className="text-[#7D8590] mb-6">You haven't cancelled any interview sessions.</p>
                        </div>
                      ) : (
                        pagedCancelled.map((booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="bg-[#161B22]/80 backdrop-blur-md border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-16 h-16 opacity-60">
                                      {booking.interviewerProfilePicture ? (
                                        <AvatarImage src={booking.interviewerProfilePicture} alt={booking.interviewerName} />
                                      ) : null}
                                      <AvatarFallback className="bg-gradient-to-br from-red-500/50 to-red-700/50 text-white font-bold text-lg">
                                        {getInitials(booking.interviewerName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-[#E6EDF3] font-bold text-xl opacity-80">{booking.interviewerName}</h3>
                                      <div className="flex items-center space-x-3 text-sm mb-2">
                                        <span className="text-[#BC8CFF] font-medium opacity-70">{booking.interviewerJobTitle || 'Software Engineer'}</span>
                                        <Badge variant="outline" className="border-red-500/50 text-red-500/70">
                                          Cancelled
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-4 text-sm text-[#7D8590]">
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {formatDateTime(booking.date, booking.startTime)}
                                        </span>
                                        <span className="flex items-center">
                                          <User className="w-4 h-4 mr-1" />
                                          Mock Interview
                                        </span>
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          60 min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <Button
                                      onClick={() => handleDetailsClick(booking)}
                                      variant="outline"
                                      className="border-[#BC8CFF]/50 text-[#BC8CFF] hover:bg-[#BC8CFF]/10 hover:border-[#BC8CFF] bg-transparent"
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Details
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                    {!loading && cancelledBookings.length > 0 && (
                      <div className="mt-6 flex justify-center">
                        <Paginator
                          page={pageCancelled}
                          totalItems={cancelledBookings.length}
                          pageSize={pageSize}
                          onPageChange={(p) => { setPageCancelled(p); setPageUpcoming(1); setPageCompleted(1); }}
                        />
                      </div>
                    )}
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <FloatingMascot />

      {/* Cancel Session Modal */}
      <AnimatePresence>
        {cancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCancelModalClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#0D1117] rounded-2xl border border-[#30363D] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-[#30363D]/50">
                <button
                  onClick={handleCancelModalClose}
                  disabled={cancelLoading}
                  className="absolute top-4 right-4 text-[#7D8590] hover:text-[#E6EDF3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#E6EDF3]">Cancel Session</h2>
                    <p className="text-[#7D8590] text-sm">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {selectedBooking && (
                  <div className="mb-6 p-4 bg-[#161B22] rounded-lg border border-[#30363D]/50">
                    <h3 className="text-sm font-medium text-[#E6EDF3] mb-2">Session Details</h3>
                    <div className="space-y-1 text-sm text-[#7D8590]">
                      <p><span className="text-[#E6EDF3]">Interviewer:</span> {selectedBooking.interviewerName}</p>
                      <p><span className="text-[#E6EDF3]">Date:</span> {formatDateTime(selectedBooking.date, selectedBooking.startTime).split(',')[0]}</p>
                      <p><span className="text-[#E6EDF3]">Time:</span> {selectedBooking.startTime}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E6EDF3] mb-2">
                      Reason for cancellation <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={cancelReason}
                      onChange={(e) => {
                        setCancelReason(e.target.value);
                        if (cancelError) setCancelError('');
                      }}
                      placeholder="Please provide a reason for cancelling this session..."
                      className="bg-[#161B22] border-[#30363D] text-[#E6EDF3] placeholder-[#7D8590] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 min-h-[100px] resize-none"
                      disabled={cancelLoading}
                    />
                    {cancelError && (
                      <p className="text-red-500 text-sm mt-1">{cancelError}</p>
                    )}
                  </div>

                  {/* Quick Reasons */}
                  <div>
                    <label className="block text-sm font-medium text-[#E6EDF3] mb-2">
                      Quick reasons (click to use)
                    </label>
                    <div className="space-y-2">
                      {commonReasons.map((commonReason, index) => (
                        <button
                          key={index}
                          onClick={() => setCancelReason(commonReason)}
                          disabled={cancelLoading}
                          className="w-full text-left p-2 text-sm text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#161B22] rounded border border-transparent hover:border-[#30363D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {commonReason}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  onClick={handleCancelModalClose}
                  disabled={cancelLoading}
                  variant="outline"
                  className="border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Session
                </Button>
                <Button
                  onClick={handleCancelConfirm}
                  disabled={cancelLoading || !cancelReason.trim()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Cancelling...</span>
                    </div>
                  ) : (
                    'Cancel Session'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedCancelledBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleDetailsModalClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#0D1117] border border-[#30363D] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-[#30363D]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">

                    <div>
                      <h2 className="text-2xl font-bold text-[#E6EDF3]">Session Details</h2>
                      <p className="text-[#7D8590]">
                        {selectedCancelledBooking.status === BookingStatus.CANCELLED ? 'Cancelled Interview Session' :
                          selectedCancelledBooking.status === BookingStatus.COMPLETED ? 'Completed Interview Session' : 'Upcoming Interview Session'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDetailsModalClose}
                    variant="outline"
                    size="sm"
                    className="border-[#30363D] text-[#7D8590] hover:bg-[#30363D] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Session Info */}
                <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#E6EDF3] mb-4">Session Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-[#BC8CFF]" />
                      <div>
                        <p className="text-sm text-[#7D8590]">Interviewer</p>
                        <p className="text-[#E6EDF3] font-medium">{selectedCancelledBooking.interviewerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#58A6FF]" />
                      <div>
                        <p className="text-sm text-[#7D8590]">Date & Time</p>
                        <p className="text-[#E6EDF3] font-medium">
                          {formatDateTime(selectedCancelledBooking.date, selectedCancelledBooking.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#3FB950]" />
                      <div>
                        <p className="text-sm text-[#7D8590]">Duration</p>
                        <p className="text-[#E6EDF3] font-medium">60 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {selectedCancelledBooking.status === BookingStatus.CANCELLED && (
                        <Badge variant="outline" className="border-red-500/50 text-red-500">Cancelled</Badge>
                      )}
                      {selectedCancelledBooking.status === BookingStatus.COMPLETED && (
                        <Badge variant="outline" className="border-green-500/50 text-green-500">Completed</Badge>
                      )}
                      {(selectedCancelledBooking.status === BookingStatus.CONFIRMED || selectedCancelledBooking.status === BookingStatus.PENDING) && (
                        <Badge variant="outline" className="border-[#58A6FF]/50 text-[#58A6FF]">Upcoming</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#BC8CFF]" />
                      <div>
                        <p className="text-sm text-[#7D8590]">Payment Method</p>
                        <p className="text-[#E6EDF3] font-medium capitalize">{selectedCancelledBooking.paymentMethod}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Hash className="w-5 h-5 text-[#58A6FF]" />
                      <div>
                        <p className="text-sm text-[#7D8590]">Booking ID</p>
                        <p className="text-[#E6EDF3] font-medium break-all">{selectedCancelledBooking.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason (only when status is CANCELLED) */}
                {selectedCancelledBooking.status === BookingStatus.CANCELLED && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-300 mb-3">Cancellation Reason</h3>
                        <p className="text-red-200 leading-relaxed">
                          {selectedCancelledBooking.cancelReason || 'No reason provided'}
                        </p>
                        <div className="mt-4 text-sm text-red-300/70">
                          Cancelled on: {new Date(selectedCancelledBooking.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {reviewModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleReviewModalClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#0D1117] border border-[#30363D] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#30363D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#E6EDF3]">Session Review</h2>
                    <p className="text-[#7D8590]">
                      Review for {selectedBookingForReview?.interviewerName || 'Interviewer'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleReviewModalClose}
                  variant="outline"
                  size="sm"
                  className="border-[#30363D] text-[#7D8590] hover:bg-[#30363D] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {reviewLoading ? (
                <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-6 text-center">
                  <p className="text-[#7D8590]">Loading review details...</p>
                </div>
              ) : reviewError ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-300">{reviewError}</p>
                </div>
              ) : reviewData ? (
                <>
                  {/* Rating Section */}
                  <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#E6EDF3] mb-4">Rating</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-6 h-6 ${s <= (reviewData?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-[#30363D]'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xl font-medium text-[#E6EDF3]">{reviewData.rating}/5</span>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#E6EDF3] mb-4">Comment</h3>
                    {reviewData.comment ? (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 text-sm text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">
                        {reviewData.comment}
                      </div>
                    ) : (
                      <p className="text-[#7D8590]">No detailed comment was provided for this session.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-[#161B22]/80 border border-[#30363D] rounded-xl p-6 text-center">
                  <p className="text-[#7D8590]">No review found for this booking.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}