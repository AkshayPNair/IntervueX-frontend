"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/intButton";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Calendar, Clock, Users, Video, Star, Eye, Award, TrendingUp, Target, Zap, Globe, Plus, User, MessageCircle } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { getVerificationStatus,VerificationStatusData } from "../../../services/interviewerService";
import { useInterviewerDashboard } from "@/hooks/useInterviewerDashboard";
import { useInterviewerBookings } from "@/hooks/useInterviewerBookings";
import { BookingStatus, InterviewerBooking } from "@/types/booking.types";
import { useUserRatingByBookingId } from "@/hooks/useUserRatingByBookingId";

const Dashboard = () => {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusData|null>(null)
  const [loading, setLoading] = useState(true)
  const { stats: dashStats, upcomingSessions, loading: dashLoading } = useInterviewerDashboard()
  const { bookings, loading: bookingsLoading } = useInterviewerBookings(1, 20, BookingStatus.COMPLETED, "")

  const recentSessions = (bookings || [])
    .filter(b => b.status === BookingStatus.COMPLETED)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const InterviewerBookingRating = ({ bookingId }: { bookingId: string }) => {
    const { data, loading } = useUserRatingByBookingId(bookingId)
    const rating = data?.rating ?? 0
    if (loading) return <span className="text-xs text-purple-300">Loading...</span>
   return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {[1,2,3,4,5].map(star => (
            <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
          ))}
        </div>
        <span className="text-xs text-purple-300">{rating}/5</span>
      </div>
    )
  }  

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


  const stats = [
     { title: "Total Interviews", value: String(dashStats.totalInterviews || 0), icon: Users, color: "text-blue-400", bgColor: "from-blue-500/20 to-blue-600/20", titleColor: "text-blue-300" },
    { title: "Hours Conducted", value: String(dashStats.hoursConducted || 0), icon: Clock, color: "text-green-400", bgColor: "from-green-500/20 to-green-600/20", titleColor: "text-green-300" },
    { title: "Avg Rating", value: Number(dashStats.averageRating || 0).toFixed(1), icon: Star, color: "text-yellow-400", bgColor: "from-yellow-500/20 to-yellow-600/20", titleColor: "text-yellow-300" },
    { title: "Success Rate", value: `${dashStats.successRate || 0}%`, icon: TrendingUp, color: "text-purple-400", bgColor: "from-purple-500/20 to-purple-600/20", titleColor: "text-purple-300" }
  ];

  const quickActions = [
    {
      title: "Sessions",
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-600/20",
      action: () => router.push("/interviewer/sessions")
    },
    {
      title: "Profile",
      icon: User,
      color: "text-green-400",
      bgColor: "from-green-500/20 to-green-600/20",
      action: () => router.push("/interviewer/profile")
    },
    {
      title: "Chat",
      icon: MessageCircle,
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-600/20",
      action: () => router.push("/interviewer/chat")
    },
    {
      title: "Settings",
      icon: Target,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-yellow-600/20",
      action: () => router.push("/interviewer/settings")
    }
  ];

  if (loading || dashLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
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
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
        <ParticleBackground />
        <main className="container mx-auto px-6 py-20 relative z-10 flex items-center justify-center">
          <div className="text-white text-xl">Redirecting...</div>
        </main>
      </div>
    );
  }


  // Helper function to format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 0) {
      // Future date
      const futureHours = Math.abs(diffInHours);
      if (futureHours < 24) return `In ${futureHours} hour${futureHours > 1 ? 's' : ''}`;
      return date.toLocaleDateString();
    }

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Generate recent activity from both completed and upcoming sessions
  const allActivities = [
    // Completed sessions
    ...recentSessions.map(session => ({
      action: "Interview completed",
      candidate: session.userName,
      time: new Date(session.date).getTime(),
      displayTime: formatTime(new Date(session.date)),
      type: "success" as const,
      session
    })),
    // Upcoming sessions
    ...upcomingSessions.slice(0, 4).map(session => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      const isToday = sessionDate.toDateString() === now.toDateString();

      return {
        action: isToday ? "Interview today" : "Interview scheduled",
        candidate: session.userName,
        time: sessionDate.getTime(),
        displayTime: formatTime(sessionDate),
        type: isToday ? "warning" : "info" as const,
        session
      };
    })
  ];

  // Sort by time (most recent first) and take top 6
  const recentActivity = allActivities
    .sort((a, b) => b.time - a.time)
    .slice(0, 6);

  // Group upcoming sessions by day of week
  const upcomingByDay = upcomingSessions.reduce((acc, session) => {
    const date = new Date(session.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(session);
    return acc;
  }, {} as Record<string, typeof upcomingSessions>);

  // Get today's sessions count
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayCount = upcomingByDay[today]?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
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
                    activity.type === 'info' ? 'bg-blue-400' : 'bg-yellow-400'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{activity.action}</p>
                    <p className="text-xs text-purple-300">{activity.candidate}</p>
                  </div>
                  <span className="text-xs text-purple-400">{activity.displayTime}</span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="flex items-center space-x-3 p-3 glass-card rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">No recent activity</p>
                    <p className="text-xs text-purple-300">Check back later</p>
                  </div>
                  <span className="text-xs text-purple-400">-</span>
                </div>
              )}
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
                <span className="text-green-400 font-bold">{dashStats.successRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${dashStats.successRate || 0}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Hours Conducted</span>
                <span className="text-blue-400 font-bold">{dashStats.hoursConducted || 0}h</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${Math.min((dashStats.hoursConducted || 0) * 10, 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Avg Rating</span>
                <span className="text-yellow-400 font-bold">{Number(dashStats.averageRating || 0)}/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${((dashStats.averageRating || 0) / 5) * 100}%` }}></div>
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
              {Object.entries(upcomingByDay).slice(0, 3).map(([day, sessions]) => (
                <div key={day} className="flex justify-between items-center p-3 glass-card rounded-xl">
                  <div>
                    <p className="text-sm text-white font-medium">{day}</p>
                    <p className="text-xs text-purple-300">{sessions.length} interview{sessions.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge className={day === today ? "status-live" : "status-scheduled"}>
                    {day === today ? "Active" : "Scheduled"}
                  </Badge>
                </div>
              ))}
              {Object.keys(upcomingByDay).length === 0 && (
                <div className="flex justify-between items-center p-3 glass-card rounded-xl">
                  <div>
                    <p className="text-sm text-white font-medium">No upcoming interviews</p>
                    <p className="text-xs text-purple-300">This week</p>
                  </div>
                  <Badge className="status-scheduled">None</Badge>
                </div>
              )}
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
                {upcomingSessions.map((s) => (
                    <div key={s.bookingId} className="glass-card p-6 rounded-2xl group border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 glow-button rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-lg text-white glow-text">{s.userName}</h4>
                            <p className="text-purple-300">{new Date(`${s.date}T${s.startTime}`).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                          <p className="text-sm font-semibold text-white">{new Date(`${s.date}`).toLocaleDateString()}</p>
                            <p className="text-sm text-purple-300">{s.startTime} - {s.endTime}</p>
                          </div>
                          <Badge className="status-scheduled border-0 px-3 py-1 font-semibold rounded-full">
                            {s.durationMinutes} min
                          </Badge>
                        </div>
                        <Button size="lg" className="glow-button border-0 hover:scale-105 transition-transform w-full rounded-xl">
                        <Link href={`/interview/${s.bookingId}`}>
                            <Video className="w-4 h-4 mr-2" />
                            View Session
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
                            <h4 className="font-bold text-lg text-white glow-text">{session.userName}</h4>
                            <p className="text-purple-300">{new Date(`${session.date}T${session.startTime}`).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{new Date(`${session.date}`).toLocaleDateString()}</p>
                            <InterviewerBookingRating bookingId={session.id} />
                          </div>
                          <Badge className="status-completed border-0 px-3 py-1 font-semibold rounded-full">
                            {session.status}
                          </Badge>
                        </div>
                        <Button size="lg" variant="outline" className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 hover:scale-105 transition-all w-full rounded-xl">
                          <Link href={`/interviewer/feedback`}>
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