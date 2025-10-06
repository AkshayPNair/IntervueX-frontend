"use client"

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Video, Users, Clock, Calendar,X,AlertTriangle , User, Briefcase, MapPin, Star, Play, Mail, Phone, Eye, MessageSquare } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { useInterviewerBookings } from "@/hooks/useInterviewerBookings";
import { useUserRatingByBookingId } from "@/hooks/useUserRatingByBookingId";
import { useDebounce } from "@/hooks/useDebounce";
import { BookingStatus, InterviewerBooking } from "@/types/booking.types";
import Paginator from "../../../components/ui/paginator";

const Sessions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { bookings, loading, error } = useInterviewerBookings(debouncedSearchTerm)

  const filteredSessions = useMemo(() => bookings.filter(session => {
    const matchesTab = activeTab === "upcoming" ? session.status === BookingStatus.CONFIRMED :
      activeTab === "completed" ? session.status === BookingStatus.COMPLETED :
        activeTab === "cancelled" ? session.status === BookingStatus.CANCELLED :
          true;
   return matchesTab;
 }), [bookings, activeTab]);

  const upcomingSessions = useMemo(() => filteredSessions.filter(booking => booking.status === BookingStatus.CONFIRMED), [filteredSessions]);
  const completedSessions = useMemo(() => filteredSessions.filter(booking => booking.status === BookingStatus.COMPLETED), [filteredSessions]);
  const cancelledSessions = useMemo(() => filteredSessions.filter(booking => booking.status === BookingStatus.CANCELLED), [filteredSessions]);

  const pageSize = 6;
  const [pageUpcoming, setPageUpcoming] = useState(1);
  const [pageCompleted, setPageCompleted] = useState(1);
  const [pageCancelled, setPageCancelled] = useState(1);

  const pagedUpcoming = useMemo(() => {
    const start = (pageUpcoming - 1) * pageSize;
    return upcomingSessions.slice(start, start + pageSize);
  }, [upcomingSessions, pageUpcoming]);

  const pagedCompleted = useMemo(() => {
    const start = (pageCompleted - 1) * pageSize;
    return completedSessions.slice(start, start + pageSize);
  }, [completedSessions, pageCompleted]);

  const pagedCancelled = useMemo(() => {
    const start = (pageCancelled - 1) * pageSize;
    return cancelledSessions.slice(start, start + pageSize);
  }, [cancelledSessions, pageCancelled]);

   const displayedSessions = useMemo(() => {
    if (activeTab === "upcoming") return pagedUpcoming;
    if (activeTab === "completed") return pagedCompleted;
    if (activeTab === "cancelled") return pagedCancelled;
    return filteredSessions;
  }, [activeTab, pagedUpcoming, pagedCompleted, pagedCancelled, filteredSessions]);

  const InterviewerBookingRating = ({ bookingId }: { bookingId: string }) => {
    const { data, loading } = useUserRatingByBookingId(bookingId)
    const rating = data?.rating ?? 0
    if (loading) return <span className="text-xs text-purple-300">Loading...</span>
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {[1,2,3,4,5].map(star => (
            <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-[#3FB950] text-[#3FB950]' : 'text-[#30363D]'}`} />
          ))}
        </div>
        <span className="text-xs text-[#7D8590]">{rating}/5</span>
        {data?.comment && (
          <span className="text-xs text-purple-300 truncate max-w-[160px]" title={data.comment}>{data.comment}</span>
        )}
      </div>
    )
  }

  const ReviewModal = ({ booking, onClose }: { booking: InterviewerBooking, onClose: () => void }) => {
    const { data, loading, error } = useUserRatingByBookingId(booking?.id)
    const rating = data?.rating ?? 0
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="card-futuristic max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-gray-900/50 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gradient-static">User Feedback</h2>
                  <button
                      onClick={onClose}
                      className="glass-effect rounded-full p-2 text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all duration-200"
                      aria-label="Close modal"
                  >
                      <X size={20} />
                  </button>
              </div>
  
              {loading ? (
                  // Simple loading message
                  <div className="flex justify-center items-center py-16">
                      <p className="text-purple-300 text-lg">Loading Feedback...</p>
                  </div>
              ) : error ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                      <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
                      <h3 className="font-semibold text-red-300">Could not load rating</h3>
                      <p className="text-sm text-red-400/80">{error}</p>
                  </div>
              ) : data ? (
                  <div className="space-y-6">
                      {/* ===== RATING SECTION (MODIFIED) ===== */}
                      <div className="flex flex-col items-center space-y-3">
                          <h3 className="text-sm font-medium text-purple-300 tracking-wider">RATING</h3>
                          <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                      <Star key={star} className={`w-8 h-8 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                  ))}
                              </div>
                              <span className="text-xl font-bold text-white">{rating} / 5</span>
                          </div>
                      </div>
                    
                      {/* Separator */}
                      <hr className="border-t border-purple-400/20" />
  
                      {/* Comment Section */}
                      <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-purple-300">
                              <MessageSquare size={18} />
                              <h3 className="text-sm font-medium tracking-wider">COMMENT</h3>
                          </div>
                          {data.comment ? (
                              <blockquote className="border-l-4 border-purple-400/50 pl-4 py-2 bg-gray-800/30 rounded-r-lg">
                                  <p className="text-base text-gray-300 whitespace-pre-wrap italic">
                                      "{data.comment}"
                                  </p>
                              </blockquote>
                          ) : (
                              <p className="text-sm text-gray-500 italic pl-4">No comment was provided.</p>
                          )}
                      </div>
                  </div>
              ) : null}
          </div>
      </div>
  )
  } 

  const currentPage = activeTab === "upcoming" ? pageUpcoming :
    activeTab === "completed" ? pageCompleted :
    activeTab === "cancelled" ? pageCancelled : 1;

  const totalItems = activeTab === "upcoming" ? upcomingSessions.length :
    activeTab === "completed" ? completedSessions.length :
    activeTab === "cancelled" ? cancelledSessions.length : filteredSessions.length;

  const [selectedCandidate, setSelectedCandidate] = useState<InterviewerBooking | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<InterviewerBooking | null>(null);

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
             onClick={() => { setActiveTab("upcoming"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeTab === "upcoming"
                ? "glow-button text-white"
                : "glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              }`}
          >
            Upcoming 
          </Button>
          <Button
            onClick={() => { setActiveTab("completed"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${activeTab === "completed"
                ? "glow-button text-white"
                : "glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20"
              }`}
          >
            Completed 
          </Button>
          <Button
            onClick={() => { setActiveTab("cancelled"); setPageUpcoming(1); setPageCompleted(1); setPageCancelled(1); }}
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
            {displayedSessions.map((session, index) => (
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
                     <>
                      <Button size="sm" asChild className="flex-1 glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 text-xs">
                        <Link href={`/interviewer/feedback`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Feedback
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setSelectedBookingForReview(session); setReviewModalOpen(true); }}
                        className="flex-1 glass-effect border-purple-400/30 text-white hover:bg-purple-500/20 text-xs"
                      >
                        Review
                      </Button>
                    </>
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

         {/* Pagination */}
        {!loading && !error && totalItems > 0 && (
          <div className="mt-8 flex justify-center">
            <Paginator
              page={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(p) => {
                if (activeTab === "upcoming") setPageUpcoming(p);
                else if (activeTab === "completed") setPageCompleted(p);
                else if (activeTab === "cancelled") setPageCancelled(p);
              }}
            />
          </div>
        )}

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <CandidateProfile
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedBookingForReview && (
          <ReviewModal
            booking={selectedBookingForReview}
            onClose={() => { setReviewModalOpen(false); setSelectedBookingForReview(null); }}
          />
        )}
      </main>
    </div>
  );
};

export default Sessions;