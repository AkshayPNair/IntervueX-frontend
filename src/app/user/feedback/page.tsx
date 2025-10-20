"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { Star, ArrowRight } from "lucide-react"
import { useUserFeedbacks } from "@/hooks/useUserFeedbacks"
import { useUserBookings } from "@/hooks/useUserBookings"
import { useEffect, useMemo, useState } from "react"
import Paginator from "../../../components/ui/paginator";

export default function FeedbackPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const pageSize = 6
  const { feedbacks, pagination, loading, error, refetch } = useUserFeedbacks(page, pageSize)
  const { bookings, loading: bookingsLoading } = useUserBookings()

  useEffect(() => {
    refetch(page)
  }, [page, refetch])

  const totalItems = pagination?.totalItems ?? 0
  const pagedFeedbacks = useMemo(() => feedbacks, [feedbacks])

 return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Interview Feedback</h1>
                <p className="text-[#7D8590] text-lg">Review your interview performance and feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#E6EDF3]">Recent Feedback</h2>

            {loading || bookingsLoading ? (
              <p className="text-[#7D8590]">Loading...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : feedbacks.length === 0 ? (
              <p className="text-[#7D8590]">No feedback yet.</p>
            ) : (
              <div className="space-y-4">
                {pagedFeedbacks.map((feedback, index) => (
                  <motion.div
                    key={feedback.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/user/feedback/${feedback.id}`)}
                  >
                    <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold">
                                  {(() => {
                                const b = bookings.find(b => b.id === feedback.bookingId)
                                const name = b?.interviewerName || 'FB'
                                return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                              })()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-[#E6EDF3] font-semibold text-lg">
                              {(() => {
                                const b = bookings.find(b => b.id === feedback.bookingId)
                                return b?.interviewerName || 'Interviewer'
                              })()}
                            </h3>
                              <p className="text-[#7D8590]">Overall • Technical • Communication • Problem Solving</p>
                              <p className="text-[#58A6FF] text-sm">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(feedback.overallRating) ? "fill-[#3FB950] text-[#3FB950]" : "text-[#30363D]"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        {feedback.overallFeedback && (
                          <p className="text-[#E6EDF3] leading-relaxed line-clamp-2">{feedback.overallFeedback}</p>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-[#BC8CFF] hover:text-[#BC8CFF]/80">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                <div className="mt-6 flex justify-center">
                  <Paginator 
                    page={page} 
                    totalItems={totalItems} 
                    onPageChange={setPage} 
                    pageSize={pageSize} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}