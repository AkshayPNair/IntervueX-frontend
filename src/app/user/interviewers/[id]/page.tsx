"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback,AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { getInterviewerById,InterviewerProfile } from "../../../../services/userService"
import {toast} from 'sonner'
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
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile|null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [loading,setLoading]=useState(false)

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        if (params.id) {
          const interviewer = await getInterviewerById(params.id as string)
          setSelectedInterviewer(interviewer)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
        <Navigation />
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
        <Navigation />
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
      <Navigation />
      
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
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 fill-[#3FB950] text-[#3FB950]" />
                          <span className="text-[#E6EDF3] font-semibold text-lg">{selectedInterviewer.rating || 4.5}</span>
                          <span className="text-[#7D8590]">(25 reviews)</span>
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
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                        <span className="text-[#E6EDF3] font-semibold">{selectedInterviewer.rating || 4.5}</span>
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
+                    <Zap className="w-8 h-8 text-[#BC8CFF]" />
+                  </div>
                  <h3 className="text-[#E6EDF3] font-semibold text-lg mb-2">Quick Book</h3>
                  <p className="text-[#7D8590] text-sm mb-4">Book a session with {selectedInterviewer.name}</p>
                  <Button
                    onClick={() => router.push(`/user/book-session/${selectedInterviewer.id}`)}
                    className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white font-medium transition-all duration-300"
                  >
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <FloatingMascot />
    </div>
  )
}