"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Target,
  FileText,
} from "lucide-react"
import { useUserFeedbackById } from "@/hooks/useUserFeedbackById"
import { useUserBookings } from "@/hooks/useUserBookings"


export default function FeedbackDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = useMemo(() => (params?.id ? String(params.id) : null), [params])
  const { feedback, loading, error } = useUserFeedbackById(id)
  const { bookings } = useUserBookings()

  const interviewerName = useMemo(() => {
    if (!feedback?.bookingId || !bookings?.length) return null
    const match = bookings.find(b => b.id === feedback.bookingId)
    return match?.interviewerName || null
  }, [feedback?.bookingId, bookings])


 if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center text-[#7D8590]">Loading...</div>
        </div>
      </div>
    )
  }
  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
          <h1 className="text-2xl font-bold text-[#E6EDF3] mb-4">{error || 'Feedback not found'}</h1>
            <Button onClick={() => router.push("/user/feedback")} className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58]">
              Back to Feedback
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/user/feedback")}
              className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feedback
            </Button>
          </motion.div>

          <div className="space-y-8">
            {/* Header */}
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold text-xl">
                      {(interviewerName || 'FB').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                    <h1 className="text-2xl font-bold text-[#E6EDF3]">{interviewerName || 'Interviewer'}</h1>
                      <p className="text-[#7D8590]">Created {new Date(feedback.createdAt).toLocaleDateString()}</p>
                      
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                             star <= Math.round(feedback.overallRating) ? "fill-[#3FB950] text-[#3FB950]" : "text-[#30363D]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[#7D8590] text-sm">Overall Rating</p>
                  </div>
                </div>

                {feedback.overallFeedback && (
                  <div>
                    <h3 className="text-[#E6EDF3] font-semibold text-lg mb-3">Overall Feedback</h3>
                    <p className="text-[#7D8590] leading-relaxed">{feedback.overallFeedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Detailed Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {[
                  { category: 'Technical Skills', score: feedback.technicalRating, description: 'Technical proficiency' },
                  { category: 'Problem Solving', score: feedback.problemSolvingRating, description: 'Approach to solving problems' },
                  { category: 'Communication', score: feedback.communicationRating, description: 'Clarity and articulation' },
                ].map((score, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#E6EDF3] font-medium">{score.category}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= score.score ? "fill-[#3FB950] text-[#3FB950]" : "text-[#30363D]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[#E6EDF3] font-semibold">{score.score}/5</span>
                      </div>
                    </div>
                    <p className="text-[#7D8590] text-sm">{score.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6 ">
            {feedback.strengths && (
                <Card className="bg-gradient-to-br from-[#3FB950]/10 to-[#2EA043]/10 backdrop-blur-md border-[#3FB950]/30 mb-8">
                  <CardHeader>
                    <CardTitle className="text-[#E6EDF3] flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-[#3FB950]" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#7D8590] whitespace-pre-line">{feedback.strengths}</p>
                  </CardContent>
                </Card>
              )}

             {feedback.improvements && (
                <Card className="bg-gradient-to-br from-[#FFA657]/10 to-[#FB8500]/10 backdrop-blur-md border-[#FFA657]/30 mb-8">
                  <CardHeader>
                    <CardTitle className="text-[#E6EDF3] flex items-center">
                      <Target className="w-5 h-5 mr-2 text-[#FFA657]" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#7D8590] whitespace-pre-line">{feedback.improvements}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <FloatingMascot />
    </div>
  )
}