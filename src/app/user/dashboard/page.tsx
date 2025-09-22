"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../../components/ui/avatar"
import { Progress } from "../../../components/ui/progress"
import { FloatingMascot } from "../../../components/ui/floating-mascot"
import { useUserDashboard } from "@/hooks/useUserDashboard"
import { useUserFeedbacks } from "@/hooks/useUserFeedbacks"
import {
  Play,
  Calendar,
  Home,
  CalendarIcon,
  Users,
  MessageSquare,
  BarChart3,
  Video,
  Star,
  Clock,
  BookOpen,
  User,
  CheckCircle,
  Award,
  Target,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardTab, setDashboardTab] = useState("overview")
  const { stats, upcomingSessions, loading } = useUserDashboard()
  const { feedbacks } = useUserFeedbacks()
  const latestFeedback = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) return null
    return [...feedbacks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }, [feedbacks])

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Interviews",
            value: String(stats.totalInterviews || 0),
            change: "",
            icon: Video,
            color: "#BC8CFF",
            bgColor: "from-[#BC8CFF]/20 to-[#3B0A58]/20",
          },
          {
            title: "Average Rating",
            value: String((stats.averageRating || 0).toFixed(1)),
            change: "",
            icon: Star,
            color: "#3FB950",
            bgColor: "from-[#3FB950]/20 to-[#2EA043]/20",
          },
          {
            title: "Success Rate",
            value: `${stats.successRate || 0}%`,
            change: "",
            icon: Target,
            color: "#58A6FF",
            bgColor: "from-[#58A6FF]/20 to-[#0969DA]/20",
          },
          {
            title: "Hours Practiced",
            value: String(stats.hoursPracticed || 0),
            change: "",
            icon: Clock,
            color: "#FFA657",
            bgColor: "from-[#FFA657]/20 to-[#FB8500]/20",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-md border-[#30363D]/50 hover:border-[#BC8CFF]/50 transition-all duration-300 overflow-hidden relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <Badge
                    className="text-xs font-semibold"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      border: `1px solid ${stat.color}40`,
                    }}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-[#E6EDF3] mb-1">{stat.value}</div>
                <div className="text-[#7D8590] text-sm font-medium">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#E6EDF3] flex items-center text-xl">
                  <CalendarIcon className="w-5 h-5 mr-3 text-[#58A6FF]" />
                  Upcoming Sessions
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#BC8CFF] hover:text-[#BC8CFF]/80"
                  onClick={() => router.push('/user/sessions')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(upcomingSessions || []).length > 0 ? (
                (upcomingSessions || []).slice(0, 3).map((session, index) => (
                  <motion.div
                    key={session.bookingId || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-[#0D1117]/50 rounded-xl border border-[#30363D]/50 hover:border-[#BC8CFF]/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white font-bold">
                            {session.interviewerName?.slice(0, 2).toUpperCase() || "IN"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-[#E6EDF3] font-semibold text-lg">{session.interviewerName}</h4>
                          <div className="flex items-center space-x-3 text-sm">
                            <span className="text-[#BC8CFF] font-medium">{new Date(`${session.date}T${session.startTime}`).toLocaleString()}</span>
                            <Badge variant="outline" className="border-[#58A6FF] text-[#58A6FF] text-xs">
                              {session.durationMinutes} min
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-[#7D8590] mt-1">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => router.push("/user/sessions")}
                          className="bg-gradient-to-r from-[#3FB950] to-[#2EA043] hover:from-[#3FB950]/80 hover:to-[#2EA043]/80"
                        >
                          View Session
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-[#7D8590] mx-auto mb-4" />
                  <p className="text-[#E6EDF3] font-semibold">No upcoming sessions</p>
                  <p className="text-[#7D8590] text-sm">You don’t have any sessions scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">

          {/* Quick Stats */}
          <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
            <CardHeader>
              <CardTitle className="text-[#E6EDF3] flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-[#58A6FF]" />
                This Week
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#7D8590]">Interviews</span>
                  <span className="text-[#E6EDF3] font-semibold">{String(stats.totalInterviews || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7D8590]">Practice Hours</span>
                  <span className="text-[#E6EDF3] font-semibold">{String(stats.hoursPracticed || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7D8590]">Avg Rating</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[#3FB950] font-semibold">{String((stats.averageRating || 0).toFixed(1))}</span>
                    <Star className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievement */}
          <Card className="bg-gradient-to-br from-[#3FB950]/20 to-[#2EA043]/20 backdrop-blur-md border-[#3FB950]/30">
            <CardHeader>
              <CardTitle className="text-[#E6EDF3] flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#3FB950]" />
                Latest Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3FB950]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-[#3FB950]" />
                </div>
                <h4 className="text-[#E6EDF3] font-semibold mb-2">Perfect Score!</h4>
                <p className="text-[#7D8590] text-sm">You scored {latestFeedback?.overallRating}/5 in your last interview</p>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">

      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Dashboard Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Welcome back, there!</h1>
                <p className="text-[#7D8590] text-lg">Ready to ace your next interview?</p>
              </div>
             
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={dashboardTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {dashboardTab === "overview" && <DashboardOverview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <FloatingMascot />
    </div>
  )
}