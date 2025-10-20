"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { useAvailableSlots } from "../../../../hooks/useAvailableSlots"
import { useBooking } from "../../../../hooks/useBooking"
import { useRazorpay } from "../../../../hooks/useRazorpay"
import { TimeSlot } from "../../../../types/slotRule.types"
import { getInterviewerById, InterviewerProfile } from "../../../../services/userService"
import { PaymentMethod,Booking } from "../../../../types/booking.types"
import { toast } from 'sonner'
import { useAuth } from "../../../../hooks/useAuth"

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Star,
  Building,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Wallet,
} from "lucide-react"

export default function BookSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile | null>(null)
  const [interviewerLoading, setInterviewerLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [discussionTopic, setDiscussionTopic] = useState("");
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const { availableSlots, loading, error, refetch } = useAvailableSlots({
    interviewerId: selectedInterviewer?.id?.toString() || '',
    selectedDate
  })

  const { bookSession, loading: bookingLoading, error: bookingError } = useBooking({
    interviewerId: selectedInterviewer?.id?.toString() || '',
    hourlyRate: selectedInterviewer?.hourlyRate || 0
  })

  const handlePaymentError = (error: string) => {
    setIsProcessing(false)
    toast.error(`Payment failed: ${error}`);
  };

  const { initiatePayment, loading: razorpayLoading } = useRazorpay({
    onSuccess: async (message: string) => {
      // Payment verified and booking confirmed
      toast.success(message);
      setIsProcessing(false);

      // Redirect to success page
      const qs = new URLSearchParams({
        date: selectedDate,
        time: `${selectedSlot?.startTime}-${selectedSlot?.endTime}`,
        interviewer: selectedInterviewer?.name || '',
        amount: String(selectedInterviewer?.hourlyRate || ''),
        ref: pendingBooking?.id || '',
      }).toString();

      setIsLeaving(true);
      setTimeout(() => {
        router.replace(`/user/book-session/success?${qs}`);
      }, 400);
    }, 
    onError: handlePaymentError
  });

  // Generate next 7 days from today
  const getNext7Days = () => {
    const days = []
    const today = new Date(currentWeekStart)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  // Generate calendar days for the month
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Sample time slots
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isSlotInPast = (slotStartTime: string, slotDate: string) => {
    const today = new Date()
    const todayDateKey = formatDateKey(today)

    // Only check for past times if the selected date is today
    if (slotDate !== todayDateKey) {
      return false
    }

    // Parse the slot time
    const [hours, minutes] = slotStartTime.split(':').map(Number)
    const slotDateTime = new Date()
    slotDateTime.setHours(hours, minutes, 0, 0)

    // Compare with current time
    const now = new Date()
    return slotDateTime <= now
  }

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        if (params.id) {
          const interviewer = await getInterviewerById(params.id as string)
          setSelectedInterviewer(interviewer)
          const today = new Date()
          setSelectedDate(formatDateKey(today))
        }
      } catch (error) {
        console.error('Error fetching interviewer:', error)
        toast.error('Failed to load interviewer profile')
      } finally {
        setInterviewerLoading(false)
      }
    }
    fetchInterviewer()
  }, [params.id])

  useEffect(() => {
    if (selectedSlot && isSlotInPast(selectedSlot.startTime, selectedDate)) {
      setSelectedSlot(null);
    }
  }, [selectedSlot, selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const canGoToPreviousWeek = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const previousWeekStart = new Date(currentWeekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)


    const previousWeekEnd = new Date(previousWeekStart)
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6)

    return previousWeekEnd >= today
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(calendarMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCalendarMonth(newDate)
  }

  const prevMonth = () => {
    const newDate = new Date(calendarMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCalendarMonth(newDate)
  }

  if (interviewerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#7D8590] text-lg">Loading interviewer profile...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedInterviewer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#E6EDF3] mb-4">Interviewer not found</h1>
            <Button onClick={() => router.push("/user/interviewers")} className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58]">
              Back to Interviewers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLeaving ? 0 : 1, y: isLeaving ? -20 : 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] text-white relative overflow-hidden"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-24 left-8 z-10"
      >
        <Button
          variant="ghost"
          onClick={() => {
            if (isProcessing) return
            router.push(`/user/interviewers/${selectedInterviewer.id}`)
          }}
          className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 bg-[#161B22]/80 backdrop-blur-md border border-[#BC8CFF]/30 hover:bg-[#BC8CFF]/10 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Profile Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] rounded-3xl p-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold text-2xl">
                    {selectedInterviewer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl md:text-5xl font-semibold text-[#E6EDF3] mb-2">
                    Book session with {selectedInterviewer.name}
                  </h1>
                  <p className="text-[#BC8CFF] text-lg font-medium">{selectedInterviewer.jobTitle || 'Software Engineer'}</p>
                  <p className="text-[#7D8590] text-sm">{selectedInterviewer.yearsOfExperience ? `${selectedInterviewer.yearsOfExperience} years experience` : '5+ years experience'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#BC8CFF] mb-2">₹ {selectedInterviewer.hourlyRate}/hr</div>
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-5 h-5 fill-[#3FB950] text-[#3FB950]" />
                  <span className="text-[#E6EDF3] font-semibold">{selectedInterviewer.rating || 4.5}</span>
                  <span className="text-[#7D8590] text-sm">(25 reviews)</span>
                </div>
                <Badge className="bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30">
                  Available
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Date Selection Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#E6EDF3]">Select Date</h2>
              {selectedDate && (
                <div className="text-[#BC8CFF] font-semibold">
                  Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={prevWeek}
                  disabled={!canGoToPreviousWeek()}
                  className={`rounded-full w-12 h-12 p-0 ${canGoToPreviousWeek()
                    ? "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#BC8CFF]/10"
                    : "text-[#30363D] cursor-not-allowed opacity-40"
                    }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                {/* Date Pills */}
                <div className="flex items-center space-x-3">
                  {getNext7Days().map((date, index) => {
                    const dateKey = formatDateKey(date)
                    const isSelected = selectedDate === dateKey
                    const isToday = formatDateKey(new Date()) === dateKey

                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const compareDate = new Date(date)
                    compareDate.setHours(0, 0, 0, 0)
                    const isPast = compareDate < today

                    return (
                      <motion.button
                        key={index}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(dateKey)
                            setSelectedSlot(null)
                          }
                        }}
                        disabled={isPast}
                        className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[90px] ${isPast
                          ? "border-[#30363D]/50 bg-[#0D1117]/30 text-[#30363D] cursor-not-allowed opacity-40"
                          : isSelected
                            ? "border-transparent bg-gradient-to-br from-[#BC8CFF] via-[#9D5CFF] to-[#7C3AED] text-white shadow-xl shadow-[#BC8CFF]/30"
                            : "border-[#30363D] bg-[#0D1117]/50 text-[#E6EDF3] hover:border-[#BC8CFF]/50 hover:bg-[#BC8CFF]/10"
                          }`}
                        whileHover={!isPast ? { scale: 1.05 } : {}}
                        whileTap={!isPast ? { scale: 0.95 } : {}}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#7D8590]'}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                          </div>
                          <div className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' :
                            isToday ? 'text-[#3FB950]' : 'text-[#E6EDF3]'
                            }`}>
                            {date.getDate()}
                          </div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#7D8590]'}`}>
                            {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                <Button
                  variant="ghost"
                  onClick={nextWeek}
                  className="text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#BC8CFF]/10 rounded-full w-12 h-12 p-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              {/* Date Picker Button */}
              <Button
                onClick={() => setShowCalendar(true)}
                className="bg-[#0D1117]/50 border border-[#30363D] text-[#E6EDF3] hover:bg-[#BC8CFF]/10 hover:border-[#BC8CFF]/50 px-6 py-3 rounded-2xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date Picker
              </Button>
            </div>
          </motion.div>

          {/* Time Slots Section */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#E6EDF3] mb-6">
                    Available Time Slots
                    <span className=" ml-4 text-[#BC8CFF] font-medium">
                      ( {new Date(selectedDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} )
                    </span>
                  </h2>
                  <div className="flex items-center space-x-2 text-[#7D8590]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Duration: 1 hour</span>
                  </div>
                </div>
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BC8CFF]"></div>
                    <span className="ml-3 text-[#7D8590]">Loading available slots...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-[#FF7B72]/10 border border-[#FF7B72]/30 rounded-2xl p-6 mb-6">
                    <div className="text-[#FF7B72] font-medium mb-2">Error loading slots</div>
                    <div className="text-[#7D8590] text-sm mb-4">{error}</div>
                    <Button
                      onClick={refetch}
                      className="bg-[#FF7B72]/20 text-[#FF7B72] border border-[#FF7B72]/30 hover:bg-[#FF7B72]/30"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Slots Grid */}
                {availableSlots && !loading && !error && (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(() => {
                      const filteredSlots = availableSlots.slots.filter(slot => !isSlotInPast(slot.startTime, selectedDate))
                      const allPastForToday = availableSlots.slots.length > 0 && availableSlots.slots.every(slot => isSlotInPast(slot.startTime, selectedDate))

                      if (filteredSlots.length > 0) {
                        return filteredSlots.map((slot, index) => {
                          const isSelected = selectedSlot === slot
                          const isSlotAvailable = slot.available

                          return (
                            <motion.button
                              key={index}
                              onClick={() => isSlotAvailable && setSelectedSlot(slot)}
                              disabled={!isSlotAvailable}
                              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                ? "border-[#3FB950] bg-gradient-to-br from-[#3FB950]/20 to-[#2EA043]/20 text-[#3FB950] shadow-lg shadow-[#3FB950]/25"
                                : isSlotAvailable
                                  ? "border-[#30363D] bg-[#0D1117]/50 text-[#E6EDF3] hover:border-[#BC8CFF]/50 hover:bg-[#BC8CFF]/10"
                                  : "border-[#6B7280] bg-[#374151]/30 text-[#9CA3AF] cursor-not-allowed opacity-60"
                                }`}
                              whileHover={isSlotAvailable ? { scale: 1.02 } : {}}
                              whileTap={isSlotAvailable ? { scale: 0.98 } : {}}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                            >
                              <div className="text-center">
                                <div className="text-sm font-bold mb-1">{formatTime(slot.startTime)}</div>
                                <div className={`text-xs font-medium ${isSelected ? 'text-[#3FB950]' :
                                  isSlotAvailable ? 'text-[#7D8590]' : 'text-[#9CA3AF]'
                                  }`}>
                                  {isSlotAvailable ? 'Available' : 'Unavailable'}
                                </div>
                              </div>
                            </motion.button>
                          )
                        })
                      }

                      // No filtered slots left to render
                      return (
                        <div className="col-span-full text-center py-12 text-[#7D8590]">
                          {availableSlots.slots.length > 0 ? (
                            allPastForToday ? (
                              <>
                                <div className="flex items-center justify-center mb-3">
                                  <Clock className="w-6 h-6 text-[#FFA657] mr-2" />
                                  <div className="text-lg font-medium text-[#FFA657]">All slots for today have passed</div>
                                </div>
                                <div className="text-sm">Today's slots are over. Please select a different date or try tomorrow</div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-medium mb-2">No available slots</div>
                                <div className="text-sm">All slots are currently booked. Please select a different date</div>
                              </>
                            )
                          ) : (
                            <>
                              <div className="text-lg font-medium mb-2">No slots available</div>
                              <div className="text-sm">No time slots are configured for this date</div>
                            </>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Section */}
          <AnimatePresence>
            {selectedDate && selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] rounded-3xl p-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#E6EDF3] mb-6">Ready to Book?</h2>
                  <div className="mb-6">
                    <div className="text-[#BC8CFF] text-lg font-semibold mb-2">
                      Session Details
                    </div>
                    <div className="text-[#7D8590] text-sm">
                      Selected slot: {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDiscussionModal(true)}
                    className="bg-gradient-to-r from-[#3FB950] to-[#2EA043] hover:from-[#3FB950]/90 hover:to-[#2EA043]/90 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Confirm Booking on {new Date(selectedDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl border-2 border-[#BC8CFF]/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[#E6EDF3] text-2xl font-bold mb-1">
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-[#7D8590] text-sm">Select your preferred date</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevMonth}
                    className="text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#BC8CFF]/10 rounded-full w-10 h-10 p-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#BC8CFF]/10 rounded-full w-10 h-10 p-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalendar(false)}
                    className="text-[#7D8590] hover:text-[#FF7B72] hover:bg-[#FF7B72]/10 rounded-full w-10 h-10 p-0 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[#7D8590] text-sm font-semibold p-3 bg-[#30363D]/30 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((date, index) => {
                  const dateKey = formatDateKey(date)
                  const isCurrentMonth = date.getMonth() === calendarMonth.getMonth()
                  const isSelected = selectedDate === dateKey
                  const isToday = formatDateKey(new Date()) === dateKey
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const compareDate = new Date(date)
                  compareDate.setHours(0, 0, 0, 0)
                  const isPast = compareDate < today


                  return (
                    <motion.button
                      key={index}
                      onClick={() => {
                        if (!isPast && isCurrentMonth) {
                          setSelectedDate(dateKey)
                          setSelectedSlot(null) // Reset selected slot when date changes
                          setShowCalendar(false)
                        }
                      }}
                      disabled={isPast || !isCurrentMonth}
                      className={`relative p-3 text-sm rounded-xl transition-all duration-300 font-medium ${isSelected
                        ? "bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg shadow-[#BC8CFF]/25 scale-105"
                        : isToday
                          ? "bg-gradient-to-br from-[#3FB950]/20 to-[#2EA043]/20 text-[#3FB950] border-2 border-[#3FB950]/50"
                          : isPast || !isCurrentMonth
                            ? "text-[#30363D] cursor-not-allowed opacity-40"
                            : "text-[#E6EDF3] hover:bg-[#BC8CFF]/10 hover:text-[#BC8CFF] hover:scale-105 bg-[#30363D]/20"
                        }`}
                      whileHover={!isPast && isCurrentMonth ? { scale: 1.1 } : {}}
                      whileTap={!isPast && isCurrentMonth ? { scale: 0.95 } : {}}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#BC8CFF]/30 to-[#3B0A58]/30 rounded-xl blur-lg" />
                      )}
                      <span className="relative z-10">{date.getDate()}</span>
                      {isToday && !isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3FB950] rounded-full animate-pulse" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-[#30363D]/50">
                <div className="flex items-center justify-between text-sm text-[#7D8590]">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#3FB950] rounded-full" />
                      <span>Today</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#BC8CFF] rounded-full" />
                      <span>Selected</span>
                    </div>
                  </div>
                  <span>Click to select a date</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

            {/* Discussion Topic Modal */}
            <AnimatePresence>
        {showDiscussionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowDiscussionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl border-2 border-[#BC8CFF]/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[#E6EDF3] text-2xl font-bold mb-2">What would you like to discuss?</h3>
                  <p className="text-[#7D8590] text-sm">
                    Share a short summary (max 100 characters) so the interviewer can prepare.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiscussionModal(false)}
                  className="text-[#7D8590] hover:text-[#FF7B72] hover:bg-[#FF7B72]/10 rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-[#0D1117]/50 rounded-2xl p-6 mb-6">
                <label className="block text-[#E6EDF3] text-sm font-semibold mb-2">
                  Discussion topic
                </label>
                <textarea
                  value={discussionTopic}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value.length <= 100) {
                      setDiscussionTopic(value);
                    }
                  }}
                  className="w-full h-28 bg-[#0D1117] border border-[#30363D] rounded-xl px-4 py-3 text-[#E6EDF3] placeholder:text-[#7D8590] focus:outline-none focus:border-[#BC8CFF]"
                  placeholder="e.g., Resume review, system design practice, interview prep..."
                />
                <div className="mt-2 text-xs text-[#7D8590]">
                  {discussionTopic.length}/100 characters
                </div>
                {discussionTopic.trim().length === 0 && (
                  <div className="mt-2 text-xs text-[#FF7B72]">
                    Discussion topic is required.
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]/20 hover:border-[#7D8590] py-3 rounded-xl"
                  onClick={() => setShowDiscussionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/90 hover:to-[#3B0A58]/90 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={discussionTopic.trim().length === 0}
                  onClick={() => {
                    setShowDiscussionModal(false);
                    setShowBookingModal(true);
                  }}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedInterviewer && selectedSlot && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl border-2 border-[#BC8CFF]/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[#E6EDF3] text-3xl font-bold mb-2">Booking Details</h3>
                  <p className="text-[#7D8590] text-sm">Review your session details before proceeding</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                  className="text-[#7D8590] hover:text-[#FF7B72] hover:bg-[#FF7B72]/10 rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Interviewer Info */}
              <div className="bg-[#0D1117]/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold text-lg">
                      {selectedInterviewer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-[#E6EDF3] text-xl font-bold">{selectedInterviewer.name}</h4>
                    <p className="text-[#BC8CFF] font-medium">{selectedInterviewer.jobTitle || 'Software Engineer'}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                      <span className="text-[#E6EDF3] text-sm font-semibold">{selectedInterviewer.rating || 4.5}</span>
                      <span className="text-[#7D8590] text-xs">(25 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-[#0D1117]/50 rounded-2xl p-6 mb-6">
                <h4 className="text-[#E6EDF3] text-lg font-bold mb-4">Session Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#BC8CFF]" />
                      <span className="text-[#7D8590]">Date</span>
                    </div>
                    <span className="text-[#E6EDF3] font-semibold">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#BC8CFF]" />
                      <span className="text-[#7D8590]">Time</span>
                    </div>
                    <span className="text-[#E6EDF3] font-semibold">
                      {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[#BC8CFF]" />
                      <span className="text-[#7D8590]">Duration</span>
                    </div>
                    <span className="text-[#E6EDF3] font-semibold">1 hour</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[#0D1117]/50 rounded-2xl p-6 mb-8">
                <h4 className="text-[#E6EDF3] text-lg font-bold mb-4">Pricing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7D8590]">Session Rate</span>
                    <span className="text-[#E6EDF3] font-semibold">₹ {selectedInterviewer.hourlyRate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7D8590]">Duration</span>
                    <span className="text-[#E6EDF3] font-semibold">1 hour</span>
                  </div>
                  <div className="border-t border-[#30363D]/50 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#E6EDF3] text-lg font-bold">Total Amount</span>
                      <span className="text-[#BC8CFF] text-2xl font-bold">₹ {selectedInterviewer.hourlyRate}</span>
                    </div>
                  </div>
                </div>
              </div>

              

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowBookingModal(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]/20 hover:border-[#7D8590] py-3 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowBookingModal(false)
                    setShowPaymentModal(true)
                  }}
                  className="flex-1 bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/90 hover:to-[#3B0A58]/90 text-white py-3 rounded-xl font-semibold"
                >
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedInterviewer && selectedSlot && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-[#161B22]/95 to-[#0D1117]/95 backdrop-blur-xl border-2 border-[#BC8CFF]/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[#E6EDF3] text-2xl font-bold mb-1">Payment Method</h3>
                  <p className="text-[#7D8590] text-sm">Choose your preferred payment option</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-[#7D8590] hover:text-[#FF7B72] hover:bg-[#FF7B72]/10 rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Payment Amount */}
              <div className="bg-[#0D1117]/50 rounded-2xl p-6 mb-6 text-center">
                <div className="text-[#7D8590] text-sm mb-2">Total Amount</div>
                <div className="text-[#BC8CFF] text-3xl font-bold">₹ {selectedInterviewer.hourlyRate}</div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4 mb-8">
                <motion.button
                  onClick={() => setSelectedPaymentMethod(PaymentMethod.WALLET)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${selectedPaymentMethod === PaymentMethod.WALLET
                      ? "border-[#3FB950] bg-gradient-to-br from-[#3FB950]/20 to-[#2EA043]/20 text-[#3FB950]"
                      : "border-[#30363D] bg-[#0D1117]/50 text-[#E6EDF3] hover:border-[#BC8CFF]/50 hover:bg-[#BC8CFF]/10"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === PaymentMethod.WALLET ? 'bg-[#3FB950]/20' : 'bg-[#30363D]/50'
                      }`}>
                      <Wallet className={`w-6 h-6 ${selectedPaymentMethod === PaymentMethod.WALLET ? 'text-[#3FB950]' : 'text-[#7D8590]'
                        }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${selectedPaymentMethod === PaymentMethod.WALLET ? 'text-[#3FB950]' : 'text-[#E6EDF3]'
                        }`}>
                        Wallet
                      </div>
                      <div className={`text-sm ${selectedPaymentMethod === PaymentMethod.WALLET ? 'text-[#3FB950]/80' : 'text-[#7D8590]'
                        }`}>
                        Pay using your wallet balance
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === PaymentMethod.WALLET
                        ? 'border-[#3FB950] bg-[#3FB950]'
                        : 'border-[#30363D]'
                      }`}>
                      {selectedPaymentMethod === PaymentMethod.WALLET && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setSelectedPaymentMethod(PaymentMethod.RAZORPAY)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${selectedPaymentMethod === PaymentMethod.RAZORPAY
                      ? "border-[#3FB950] bg-gradient-to-br from-[#3FB950]/20 to-[#2EA043]/20 text-[#3FB950]"
                      : "border-[#30363D] bg-[#0D1117]/50 text-[#E6EDF3] hover:border-[#BC8CFF]/50 hover:bg-[#BC8CFF]/10"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPaymentMethod === PaymentMethod.RAZORPAY ? 'bg-[#3FB950]/20' : 'bg-[#30363D]/50'
                      }`}>
                      <CreditCard className={`w-6 h-6 ${selectedPaymentMethod === PaymentMethod.RAZORPAY ? 'text-[#3FB950]' : 'text-[#7D8590]'
                        }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${selectedPaymentMethod === PaymentMethod.RAZORPAY ? 'text-[#3FB950]' : 'text-[#E6EDF3]'
                        }`}>
                        Razorpay
                      </div>
                      <div className={`text-sm ${selectedPaymentMethod === PaymentMethod.RAZORPAY ? 'text-[#3FB950]/80' : 'text-[#7D8590]'
                        }`}>
                        Pay with card, UPI, or net banking
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === PaymentMethod.RAZORPAY
                        ? 'border-[#3FB950] bg-[#3FB950]'
                        : 'border-[#30363D]'
                      }`}>
                      {selectedPaymentMethod === PaymentMethod.RAZORPAY && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline"
                  className="flex-1 bg-transparent border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]/20 hover:border-[#7D8590] py-3 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedPaymentMethod) {
                      toast.error('Please select a payment method');
                      return;
                    }

                    if (selectedPaymentMethod === PaymentMethod.WALLET) {
                      try {
                        if (selectedSlot && selectedDate) {
                          setIsProcessing(true)
                          const booking = await bookSession(
                            selectedDate,
                            selectedSlot,
                            PaymentMethod.WALLET,
                            discussionTopic.trim()
                          );
                          toast.success('Booking confirmed successfully!');
                          const qs = new URLSearchParams({
                            date: selectedDate,
                            time: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
                            interviewer: selectedInterviewer?.name || '',
                            amount: String(selectedInterviewer?.hourlyRate || ''),
                            ref: booking?.id || ''
                          }).toString();
                          setIsLeaving(true)
                          setTimeout(() => {
                            router.push(`/user/book-session/success?${qs}`)
                          }, 400)
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || 'Failed to book session');
                      } finally {
                        setIsProcessing(false)
                      }
                    } else if (selectedPaymentMethod === PaymentMethod.RAZORPAY) {
                       if (selectedSlot && selectedDate && selectedInterviewer?.hourlyRate) {
                        try {
                          setIsProcessing(true)
                          // Create pending booking first
                          const booking = await bookSession(
                            selectedDate,
                            selectedSlot,
                            PaymentMethod.RAZORPAY,
                            discussionTopic.trim()
                          );
                          setPendingBooking(booking);

                          // Then initiate payment
                          await initiatePayment(
                            selectedInterviewer.hourlyRate,
                            selectedInterviewer.name,
                            user?.email || '',
                            `Booking with ${selectedInterviewer.name} on ${new Date(selectedDate).toLocaleDateString()}`,
                            booking.id
                          );
                        } catch (err: any) {
                          toast.error(err.response?.data?.error || 'Failed to initiate payment');
                          setIsProcessing(false);
                        }
                      }
                    }
                  }}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="flex-1 bg-gradient-to-r from-[#3FB950] to-[#2EA043] hover:from-[#3FB950]/90 hover:to-[#2EA043]/90 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Confirm Booking
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-page processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-[#0D1117] border border-[#30363D] rounded-3xl p-8 w-[90%] max-w-md text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#BC8CFF]/30 border-t-[#BC8CFF] animate-spin" />
              <div className="text-[#E6EDF3] text-xl font-semibold">Processing your booking...</div>
              <div className="text-[#7D8590] text-sm mt-1">Please wait, do not close this window.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
