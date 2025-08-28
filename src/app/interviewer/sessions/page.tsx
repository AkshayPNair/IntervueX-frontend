"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Video, Users, Clock, Calendar, User, Briefcase, MapPin, Star, Play, Mail, Phone, Eye } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { useInterviewerBookings } from "@/hooks/useInterviewerBookings";
import { BookingStatus, InterviewerBooking } from "@/types/booking.types";

const Sessions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const { bookings, loading, error } = useInterviewerBookings()

  const filteredSessions = bookings.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "upcoming" ? session.status === BookingStatus.CONFIRMED :
      activeTab === "completed" ? session.status === BookingStatus.COMPLETED :
        activeTab === "cancelled" ? session.status === BookingStatus.CANCELLED :
          true;
    return matchesSearch && matchesTab;
  });

  const upcomingSessions = filteredSessions.filter(booking => booking.status === BookingStatus.CONFIRMED);
  const completedSessions = filteredSessions.filter(booking => booking.status === BookingStatus.COMPLETED);
  const cancelledSessions = filteredSessions.filter(booking => booking.status === BookingStatus.CANCELLED);

  const [selectedCandidate, setSelectedCandidate] = useState<InterviewerBooking | null>(null);

  const CandidateProfile = ({ candidate, onClose }: { candidate: InterviewerBooking; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card-futuristic max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 rounded-2xl custom-scrollbar">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient-static">Interview Details</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 glow-button rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {candidate.userName ? candidate.userName.split(' ').map(n => n[0]).join('') : 'N/A'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{candidate.userName || 'Unknown User'}</h3>
                <p className="text-purple-300">{candidate.userEmail}</p>
                <p className="text-purple-400 text-sm">Interview Candidate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-purple-200 text-sm">{candidate.userEmail}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-purple-200 text-sm">{new Date(candidate.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200 text-sm">{candidate.startTime} - {candidate.endTime}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-200 text-sm">₹{candidate.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="glass-card p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3">Payment Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span className="text-purple-200 text-sm">Total: ₹{candidate.amount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-green-400" />
                <span className="text-purple-200 text-sm">Your Earning: ₹{candidate.interviewerAmount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200 text-sm">Admin Fee: ₹{candidate.adminFee}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-200 text-sm">Method: {candidate.paymentMethod.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/*status */}
          <div className="glass-card p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3">Booking Status</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
              <Badge className={`${
                  candidate.status === BookingStatus.CONFIRMED ? "status-scheduled" : 
                  candidate.status === BookingStatus.COMPLETED ? "status-completed" : 
                  "bg-red-500/20 text-red-300"
                } border-0 px-3 py-1 text-xs`}>
                  {candidate.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-purple-200 text-sm">Booked: {new Date(candidate.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-purple-200 text-sm">Updated: {new Date(candidate.updatedAt).toLocaleString()}</span>
              </div>
              {candidate.status === BookingStatus.CANCELLED && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl glass-effect">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-sm">✗</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-red-300 mb-2">Cancellation Reason</h5>
                      <p className="text-red-200 text-sm leading-relaxed">{candidate.cancelReason || 'No reason provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
      <ParticleBackground />

      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient-static  text-left">Sessions</h1>
        </div>

        {/* Enhanced Search Bar */}
        <div className="card-futuristic p-6 mb-8 animate-scale-in rounded-2xl">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-sm"></div>
            <div className="relative flex items-center bg-black/40 border border-purple-400/30 rounded-2xl p-2">
              <Search className="absolute left-6 text-purple-400 w-5 h-5 z-10" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 h-12 bg-transparent border-0 text-white placeholder:text-purple-300 focus:ring-0 focus:outline-none text-lg rounded-xl"
              />

            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-8 space-x-4">
          <Button
            onClick={() => setActiveTab("upcoming")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeTab === "upcoming"
                ? "glow-button text-white"
                : "glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              }`}
          >
            Upcoming 
          </Button>
          <Button
            onClick={() => setActiveTab("completed")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeTab === "completed"
                ? "glow-button text-white"
                : "glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              }`}
          >
            Completed 
          </Button>
          <Button
            onClick={() => setActiveTab("cancelled")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeTab === "cancelled"
                ? "glow-button text-white"
                : "glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              }`}
          >
            Cancelled 
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card-futuristic p-12 text-center animate-fade-in rounded-2xl">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading sessions...</h3>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-futuristic p-12 text-center animate-fade-in rounded-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error loading sessions</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="glow-button"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions.map((session, index) => (
              <div
                key={session.id}
                className="card-futuristic hover-glow p-6 animate-fade-in rounded-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 glow-button rounded-xl flex items-center justify-center text-lg font-bold text-white">
                      {session.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{session.userName}</h3>
                      <p className="text-purple-300 text-sm">{session.userEmail}</p>
                    </div>
                  </div>
                  <Badge className={`${
                  session.status === BookingStatus.CONFIRMED ? "status-scheduled" : 
                  session.status === BookingStatus.COMPLETED ? "status-completed" : 
                  "bg-red-500/20 text-red-300"
                } border-0 px-3 py-1 text-xs`}>
                  {session.status === BookingStatus.CONFIRMED ? 'upcoming' : 
                   session.status === BookingStatus.COMPLETED ? 'completed' : 'cancelled'}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-purple-200 text-sm">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-purple-200 text-sm">{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200 text-sm">₹{session.amount}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 glass-effect border border-purple-400/30 rounded-full text-xs text-purple-200">
                      {session.paymentMethod.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 glass-effect border border-green-400/30 rounded-full text-xs text-green-200">
                      ₹{session.interviewerAmount} earned
                    </span>
                  </div>
                </div>

                {/* STatus info */}
                {session.status === BookingStatus.COMPLETED && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-green-400 text-sm">✓ Interview Completed</span>
                    </div>
              )}
              {session.status === BookingStatus.CANCELLED && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-red-400 text-sm">✗ Interview Cancelled</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {session.status === BookingStatus.CONFIRMED ? (
                    <Button size="sm" asChild className="flex-1 glow-button border-0 text-xs">
                      <Link href={`/interviewer/sessions/${session.id}`}>
                        <Video className="w-4 h-4 mr-1" />
                        Start
                      </Link>
                    </Button>
                  ) : session.status === BookingStatus.COMPLETED ? (
                    <Button size="sm" asChild className="flex-1 glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 text-xs">
                      <Link href={`/interviewer/feedback/${session.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Feedback
                      </Link>
                    </Button>
                  ):null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCandidate(session)}
                    className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 text-xs"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredSessions.length === 0 && (
          <div className="card-futuristic p-12 text-center animate-fade-in rounded-2xl">
            <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sessions found</h3>
            <p className="text-purple-300">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <CandidateProfile
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Sessions;