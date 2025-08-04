"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/intButton";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Calendar, Clock, Users, Video, Star, Eye, Award, TrendingUp, Target, Zap, Globe, Plus } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { getVerificationStatus,VerificationStatusData } from "../../../services/interviewerService";

const Dashboard = () => {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusData|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const status = await getVerificationStatus()
        setVerificationStatus(status)

        if (!status.hasSubmittedVerification) {
          router.push('/interviewer/verification')
          return
        }

        if (status.hasSubmittedVerification && !status.isApproved) {
          router.push('/interviewer/verification')
          return
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        router.push('/interviewer/verification');
      } finally {
        setLoading(false)
      }

    }
    checkVerificationStatus()
  }, [router])

  const upcomingInterviews = [
    {
      id: 1,
      candidate: "Alice Johnson",
      position: "Frontend Developer",
      time: "2:00 PM",
      date: "Today",
      status: "scheduled"
    },
    {
      id: 2,
      candidate: "Bob Smith",
      position: "Backend Engineer",
      time: "4:30 PM",
      date: "Tomorrow",
      status: "confirmed"
    },
    {
      id: 3,
      candidate: "Sarah Wilson",
      position: "Full Stack Developer",
      time: "10:00 AM",
      date: "Dec 20",
      status: "scheduled"
    }
  ];

  const recentSessions = [
    {
      id: 1,
      candidate: "David Wilson",
      position: "DevOps Engineer",
      date: "Dec 15, 2024",
      rating: 4,
      status: "completed"
    },
    {
      id: 2,
      candidate: "Emma Brown",
      position: "React Developer",
      date: "Dec 14, 2024",
      rating: 5,
      status: "completed"
    },
    {
      id: 3,
      candidate: "Frank Miller",
      position: "Python Developer",
      date: "Dec 13, 2024",
      rating: 3,
      status: "completed"
    }
  ];

  const stats = [
    { title: "Total Interviews", value: "47", icon: Users, color: "text-blue-400", bgColor: "from-blue-500/20 to-blue-600/20", titleColor: "text-blue-300" },
    { title: "This Week", value: "8", icon: Calendar, color: "text-green-400", bgColor: "from-green-500/20 to-green-600/20", titleColor: "text-green-300" },
    { title: "Avg Rating", value: "4.2", icon: Star, color: "text-yellow-400", bgColor: "from-yellow-500/20 to-yellow-600/20", titleColor: "text-yellow-300" },
    { title: "Active Sessions", value: "1", icon: Video, color: "text-purple-400", bgColor: "from-purple-500/20 to-purple-600/20", titleColor: "text-purple-300" }
  ];

  const quickActions = [
    {
      title: "Schedule Interview",
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-600/20",
      action: () => router.push("/sessions")
    },
    {
      title: "View Analytics",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "from-green-500/20 to-green-600/20",
      action: () => router.push("/history")
    },
    {
      title: "Candidate Pool",
      icon: Users,
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-600/20",
      action: () => router.push("/sessions")
    },
    {
      title: "Settings",
      icon: Target,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-yellow-600/20",
      action: () => router.push("/settings")
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg relative">
        <ParticleBackground />
        <main className="container mx-auto px-6 py-20 relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </main>
      </div>
    );
  }

  // Don't render dashboard if not approved
  if (!verificationStatus?.isApproved) {
    return (
      <div className="min-h-screen gradient-bg relative">
        <ParticleBackground />
        <main className="container mx-auto px-6 py-20 relative z-10 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </div>
    );
  }


  const recentActivity = [
    { action: "Interview completed", candidate: "John Doe", time: "2 hours ago", type: "success" },
    { action: "New candidate registered", candidate: "Jane Smith", time: "4 hours ago", type: "info" },
    { action: "Interview scheduled", candidate: "Mike Johnson", time: "6 hours ago", type: "warning" },
    { action: "Feedback submitted", candidate: "Sarah Connor", time: "1 day ago", type: "success" }
  ];

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />


      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`card-futuristic p-6 bg-gradient-to-br ${stat.bgColor} animate-scale-in rounded-2xl hover:shadow-2xl transition-all duration-300`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.titleColor} mb-2 glow-text`}>{stat.title}</p>
                  <p className="text-3xl font-bold text-white glow-text">{stat.value}</p>
                </div>
                <div className="relative">
                  <div className={`w-12 h-12 glow-button rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card-futuristic p-6 mb-8 rounded-2xl">
          <h3 className="text-xl font-bold text-gradient mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.bgColor} border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 group`}
              >
                <action.icon className={`w-6 h-6 ${action.color} mx-auto mb-2`} />
                <p className="text-sm text-white font-medium">{action.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="card-futuristic p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-gradient mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 glass-card rounded-xl">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{activity.action}</p>
                    <p className="text-xs text-purple-300">{activity.candidate}</p>
                  </div>
                  <span className="text-xs text-purple-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card-futuristic p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-gradient mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Success Rate</span>
                <span className="text-green-400 font-bold">89%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Avg Duration</span>
                <span className="text-blue-400 font-bold">45 min</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Satisfaction</span>
                <span className="text-yellow-400 font-bold">4.2/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>

          {/* Upcoming This Week */}
          <div className="card-futuristic p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-gradient mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 glass-card rounded-xl">
                <div>
                  <p className="text-sm text-white font-medium">Today</p>
                  <p className="text-xs text-purple-300">3 interviews</p>
                </div>
                <Badge className="status-live">Active</Badge>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-xl">
                <div>
                  <p className="text-sm text-white font-medium">Tomorrow</p>
                  <p className="text-xs text-purple-300">2 interviews</p>
                </div>
                <Badge className="status-scheduled">Scheduled</Badge>
              </div>
              <div className="flex justify-between items-center p-3 glass-card rounded-xl">
                <div>
                  <p className="text-sm text-white font-medium">Friday</p>
                  <p className="text-xs text-purple-300">1 interview</p>
                </div>
                <Badge className="status-scheduled">Scheduled</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="scheduled" className="space-y-8">
          <div className="card-futuristic p-2 rounded-2xl">
            <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2">
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:glow-button data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-3 font-semibold transition-all"
              >
                Scheduled
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:glow-button data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-3 font-semibold transition-all"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="scheduled" className="space-y-6">
            <div className="card-futuristic animate-fade-in rounded-2xl">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-gradient">Upcoming Interviews</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="glass-card p-6 rounded-2xl group border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 glow-button rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-white glow-text">{interview.candidate}</h4>
                            <p className="text-purple-300">{interview.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{interview.date}</p>
                            <p className="text-sm text-purple-300">{interview.time}</p>
                          </div>
                          <Badge className={`${interview.status === "confirmed" ? "status-scheduled" : "status-completed"} border-0 px-3 py-1 font-semibold rounded-full`}>
                            {interview.status}
                          </Badge>
                        </div>
                        <Button size="lg" className="glow-button border-0 hover:scale-105 transition-transform w-full rounded-xl">
                          <Link href={`/interview/${interview.id}`}>
                            <Video className="w-4 h-4 mr-2" />
                            Start Interview
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="card-futuristic animate-fade-in rounded-2xl">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-gradient">Recent Sessions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="glass-card p-6 rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 status-completed rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-white glow-text">{session.candidate}</h4>
                            <p className="text-purple-300">{session.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{session.date}</p>
                            <div className="flex items-center space-x-1 justify-start mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <Badge className="status-completed border-0 px-3 py-1 font-semibold rounded-full">
                            {session.status}
                          </Badge>
                        </div>
                        <Button size="lg" variant="outline" className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 hover:scale-105 transition-all w-full rounded-xl">
                          <Link href={`/feedback/${session.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Feedback
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;