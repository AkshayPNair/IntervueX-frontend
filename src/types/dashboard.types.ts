export interface UserDashboardStats {
  totalInterviews: number
  averageRating: number
  successRate: number
  hoursPracticed: number
}

export interface UpcomingSession {
  bookingId: string
  interviewerId: string
  interviewerName: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
}

export interface UserDashboardResponse {
  stats: UserDashboardStats
  upcomingSessions: UpcomingSession[]
}

export interface InterviewerDashboardStats {
  totalInterviews: number
  averageRating: number
  successRate: number
  hoursConducted: number
}

export interface InterviewerUpcomingSession {
  bookingId: string
  userId: string
  userName: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
}

export interface InterviewerDashboardResponse {
  stats: InterviewerDashboardStats
  upcomingSessions: InterviewerUpcomingSession[]
}

export interface AdminMonthlyGrowth {
  users: number
  interviews: number
  revenue: number
}

export interface AdminStats {
  totalUsers: number
  activeSessions: number
  pendingRequests: number
  totalInterviews: number
  totalCompilerRequests: number
  totalRevenue: number
  monthlyGrowth: AdminMonthlyGrowth
}

export type AdminActivityType =
  | 'user_registration'
  | 'interviewer_approval'
  | 'booking_completed'
  | 'feedback_submitted'
  | 'payment_received'

export interface AdminActivity {
  id: string
  type: AdminActivityType
  message: string
  timestamp: string | Date
  userName?: string
  interviewerName?: string
}

export interface SeriesPoint { name: string; value: number }
export interface SeriesGroup { week: SeriesPoint[]; month: SeriesPoint[]; year: SeriesPoint[] }

export interface AdminDashboardResponse {
  stats: AdminStats
  recentActivity: AdminActivity[]
  sessionSeries: SeriesGroup
  usersSeries: SeriesGroup
}