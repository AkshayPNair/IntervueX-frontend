"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { startOrGetConversation } from "../../../../services/chatService"
import { getInterviewerById, getInterviewerRatings, InterviewerProfile } from "../../../../services/userService"
import { InterviewerRatingData } from "@/types/feedback.types"
import Paginator from "@/components/ui/paginator"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import {  
  ArrowLeft,
  Building,
  MapPin,
  Star,
  Briefcase,
  GraduationCap,
  Languages,
  Zap,
} from "lucide-react"

export default function InterviewerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile|null>(null)
  const [ratings, setRatings] = useState<InterviewerRatingData[]>([])
  const [page, setPage] = useState(1)
  const [loading,setLoading]=useState(false)

  const pageSize = 3

  useEffect(() => {
    const fetchInterviewer = async () => {
      setLoading(true)
      try {
        setPage(1)
        if (params.id) {
          const interviewer = await getInterviewerById(params.id as string)
          const interviewerRatings = await getInterviewerRatings(params.id as string)
          setSelectedInterviewer(interviewer)
          setRatings(interviewerRatings)
        }
      } catch (error) {
        console.error('Error fetching interviewer:', error)
        toast.error('Failed to load interviewer profile')
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewer()
  }, [params.id])

  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length).toFixed(1)
    : 'N/A'


  const hasRatings = ratings.length > 0

  const pagedRatings = useMemo(() => {
    if (!hasRatings) return []
    const startIndex = (page - 1) * pageSize
    return ratings.slice(startIndex, startIndex + pageSize)
  }, [ratings, page, pageSize, hasRatings])

  const formatRatingDate = (value: string | Date) => {
    const parsedDate = new Date(value)

    if (Number.isNaN(parsedDate.getTime())) {
      return '--'
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/user/interviewers")}
              className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Interviewers
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6 mb-6">
                    <Avatar className="w-24 h-24">
                      {selectedInterviewer.profilePicture ? (
                        <AvatarImage src={selectedInterviewer.profilePicture} alt={selectedInterviewer.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white text-3xl font-bold">
                          {selectedInterviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-[#E6EDF3] mb-2">{selectedInterviewer.name}</h1>
                      <p className="text-xl text-[#BC8CFF] font-semibold mb-2">{selectedInterviewer.jobTitle || 'Software Engineer'}</p>
                      <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 fill-[#3FB950] text-[#3FB950]" />
                          <span className="text-[#E6EDF3] font-semibold text-lg">{averageRating}</span>
                          <span className="text-[#7D8590]">({ratings.length} ratings)</span>
                        </div>
                        <div className="text-2xl font-bold text-[#BC8CFF]">₹ {selectedInterviewer.hourlyRate}/hr</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#E6EDF3] font-semibold text-lg mb-3">About</h3>
                      <p className="text-[#7D8590] leading-relaxed">
                        {selectedInterviewer.professionalBio || 'Experienced software engineer with a passion for helping others succeed in technical interviews.'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-[#E6EDF3] font-semibold text-lg mb-3">Experience</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-[#58A6FF]" />
                            <span className="text-[#7D8590]">
                              {selectedInterviewer.yearsOfExperience ? `${selectedInterviewer.yearsOfExperience} years experience` : '5+ years experience'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Languages className="w-4 h-4 text-[#58A6FF]" />
                            <span className="text-[#7D8590]">English</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[#E6EDF3] font-semibold text-lg mb-3">Statistics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-[#7D8590]">Total Interviews</span>
                            {/* <span className="text-[#E6EDF3] font-semibold">/*{selectedInterviewer.totalInterviews}</span> */}
                            <span className="text-[#E6EDF3] font-semibold">200</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7D8590]">Success Rate</span>
                            {/* <span className="text-[#3FB950] font-semibold">{selectedInterviewer.successRate}%</span> */}
                            <span className="text-[#3FB950] font-semibold">92%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7D8590]">Response Time</span>
                            <span className="text-[#E6EDF3] font-semibold">&lt; 2 hours</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[#E6EDF3] font-semibold text-lg mb-3">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                      {selectedInterviewer.technicalSkills && selectedInterviewer.technicalSkills.length > 0 ? (
                          selectedInterviewer.technicalSkills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-[#58A6FF] text-[#58A6FF] px-3 py-1">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          ['JavaScript', 'React', 'Node.js', 'Python'].map((skill, index) => (
                            <Badge key={index} variant="outline" className="border-[#58A6FF] text-[#58A6FF] px-3 py-1">
                              {skill}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-[#E6EDF3]">Ratings &amp; reviews</CardTitle>
                  <p className="text-[#7D8590] text-sm">
                    Feedback from interviewees who have recently completed sessions
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {hasRatings ? (
                    <div className="space-y-4">
                      {pagedRatings.map((rating) => (
                        <div key={rating.id} className="rounded-lg border border-[#30363D] bg-[#0D1117]/60 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[#161B22] text-[#BC8CFF]">
                                  {rating.userName?.slice(0, 2).toUpperCase() ?? "NA"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-[#E6EDF3]">
                                  {rating.userName ?? "Anonymous user"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 fill-[#3FB950] text-[#3FB950]" />
                                  <span className="text-sm font-medium text-[#E6EDF3]">
                                    {rating.rating.toFixed(1)} / 5
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-[#7D8590]">
                              {formatRatingDate(rating.createdAt)}
                            </span>
                          </div>
                          {rating.comment ? (
                            <p className="mt-3 text-sm leading-relaxed text-[#7D8590]">
                              {rating.comment}
                            </p>
                          ) : (
                            <p className="mt-3 text-sm italic text-[#4C566A]">
                              No written feedback provided
                            </p>
                          )}
                        </div>
                      ))}

                      <Paginator
                        page={page}
                        totalItems={ratings.length}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        className="pt-2 text-white"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#30363D] bg-[#0D1117]/50 p-6 text-center">
                      <p className="text-sm text-[#7D8590]">
                        Ratings from recent interviewees will appear here once available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Section */}
            <div className="space-y-6">
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-[#E6EDF3]">Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#7D8590]">Hourly Rate</span>
                      <span className="text-[#BC8CFF] font-semibold text-lg">₹ {selectedInterviewer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7D8590]">Rating</span>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                        <span className="text-[#E6EDF3] font-semibold">{averageRating}</span>
                        <span className="text-xs text-[#7D8590]">({ratings.length})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#7D8590]">Experience</span>
                      <span className="text-[#E6EDF3] font-semibold">
                        {selectedInterviewer.yearsOfExperience ? `${selectedInterviewer.yearsOfExperience} years` : '5+ years'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#BC8CFF]/20 to-[#3B0A58]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-[#BC8CFF]" />
                  </div>
                  <h3 className="text-[#E6EDF3] font-semibold text-lg mb-2">Quick Actions</h3>
                  <p className="text-[#7D8590] text-sm mb-4">Reach out or book a session with {selectedInterviewer.name}</p>
                  <div className="grid gap-3">
                    <Button
                      onClick={() => router.push(`/user/book-session/${selectedInterviewer.id}`)}
                      className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white font-medium transition-all duration-300"
                    >
                      Book Session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const conv = await startOrGetConversation({ interviewerId: selectedInterviewer.id })
                          // Navigate to user chat and select this conversation via query string
                          router.push(`/user/chat?conv=${conv.id}`)
                        } catch (err) {
                          console.error('Failed to start chat', err)
                          toast.error('Failed to start chat')
                        }
                      }}
                      className="w-full border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10"
                    >
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}