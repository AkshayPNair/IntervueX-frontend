"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { getAllInterviewers, InterviewerProfile } from "../../../services/userService"
import { toast } from 'sonner'
import {
  Search,
  Building,
  Star,
  Plus,
  User,
  Clock,
} from "lucide-react"



export default function InterviewersPage() {
  const router = useRouter()
  const [interviewers, setInterviewers] = useState<InterviewerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const data = await getAllInterviewers()
        setInterviewers(data)
      } catch (error) {
        console.error('Error fetching interviewers:', error)
        toast.error('Failed to load interviewers')
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewers()
  }, [])

  const filteredInterviewers = interviewers.filter(interviewer => {
    const query = searchQuery.toLowerCase()
    return (
      interviewer.name.toLowerCase().includes(query) ||
      interviewer.jobTitle?.toLowerCase().includes(query) ||
      interviewer.technicalSkills?.some(skill => 
        skill.toLowerCase().includes(query)
      )
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">

      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Find Interviewers</h1>
                <p className="text-[#7D8590] text-lg">Connect with expert interviewers from top companies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#E6EDF3]">Available Interviewers</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-4 h-4" />
                  <Input
                    placeholder="Search interviewers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] w-64"
                  />
                </div>
                <Button variant="outline" className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10 bg-transparent">
                  Filter
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-[#7D8590]">Loading interviewers...</div>
                </div>
            ) : filteredInterviewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-[#7D8590] text-lg mb-2">No interviewers found</div>
                <div className="text-[#7D8590] text-sm">
                  {searchQuery ? `No results for "${searchQuery}"` : "No interviewers available"}
                </div>
              </div>  
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInterviewers.map((interviewer, index) => (
                  <motion.div
                    key={interviewer.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300 h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              {interviewer.profilePicture ? (
                                <AvatarImage src={interviewer.profilePicture} alt={interviewer.name} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold">
                                  {interviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <h3 className="text-[#E6EDF3] font-bold">{interviewer.name}</h3>
                              <p className="text-[#BC8CFF] text-sm font-medium">{interviewer.jobTitle}</p>
                            </div>
                          </div>
                          <Badge className="bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30">
                            Available
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                            <span className="text-[#E6EDF3] font-semibold">{interviewer.rating || 4.5}</span>
                            <span className="text-[#7D8590] text-sm">(25 reviews)</span>
                          </div>
                          <div className="text-[#BC8CFF] font-semibold">${interviewer.hourlyRate || 150}/hr</div>
                        </div>
                        <div>
                          {/* Experience */}
                          <div className="text-[#7D8590] text-sm">
                            {interviewer.yearsOfExperience ? `${interviewer.yearsOfExperience} years experience` : '8 years experience'}
                          </div>



                          <div>

                            <div className="flex flex-wrap gap-1 mt-2 ">
                              {interviewer.technicalSkills?.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="outline" className="border-[#58A6FF] text-[#58A6FF] text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#7D8590] text-[#7D8590] hover:bg-[#30363D]/50 bg-transparent"
                            onClick={() => {
                              setSelectedInterviewer(interviewer)
                              router.push(`/user/interviewers/${interviewer.id}`)
                            }}
                          >
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80"
                            onClick={() => {
                              setSelectedInterviewer(interviewer)
                              setShowBookingModal(true)
                            }}
                          >
                            Book Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}