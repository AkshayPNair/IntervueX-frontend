"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Star, Eye, Filter, ArrowBigRight, ArrowRight } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { useInterviewerBookings } from '@/hooks/useInterviewerBookings'
import { useInterviewerFeedbacks } from '@/hooks/useInterviewerFeedbacks'
import Paginator from "../../../components/ui/paginator";
import { useDebounce } from '@/hooks/useDebounce';
import { BookingStatus } from "@/types/booking.types";

const SessionHistory = () => {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const status: BookingStatus = BookingStatus.COMPLETED;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { feedbacks, pagination, loading } = useInterviewerFeedbacks(page, pageSize, debouncedSearchTerm, sortBy);
  const { bookings } = useInterviewerBookings(1, 1000, status, debouncedSearchTerm);

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, sortBy])

  const getStars = (rating: number) => (
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
      <ParticleBackground />

      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 text-gradient">Feedback History</h1>
          <p className="text-purple-300">Review your submitted feedbacks</p>
        </div>

        <div className="card-futuristic mb-8 hover-glow animate-fade-in rounded-2xl">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <span className="text-xl font-bold text-gradient">Filter & Search</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
                <Input
                  placeholder="Search in feedback text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 glass-effect border-purple-400/30 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="card-futuristic border-purple-400/30">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-xl font-bold text-gradient">Your Feedbacks</h2>
            </div>
            <p className="text-purple-300 mb-6">{loading ? 'Loading...' : `${pagination?.totalItems || 0} feedbacks found`}</p>

            <div className="space-y-4">
            {feedbacks && feedbacks.map((f, index) => (
                <div key={f.id} className="flex items-center justify-between p-4 glass-card rounded-xl hover-glow transition-all duration-200 border border-purple-400/20" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center gap-6">
                  {(() => {
                      const booking = bookings.find(bk => bk.id === f.bookingId);
                      const name = booking?.userName || 'Unknown User';
                      const dateStr = new Date(booking?.date || f.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                      const timeStr = booking?.startTime || new Date(f.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                      return (
                        <>
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {name.slice(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{name}</h4>
                            <div className="flex items-center space-x-1">
                              {getStars(f.overallRating || 0)}
                              <span className="text-xs text-muted-foreground">({f.overallRating || 0}/5)</span>
                            </div>
                          </div>
                        </>
                     );
                    })()}
                  </div>
                  <div className="flex items-center gap-6 mr-10">
                    {(() => {
                      const booking = bookings.find(bk => bk.id === f.bookingId);
                      const dateStr = new Date(booking?.date || f.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                      const timeStr = booking?.startTime || new Date(f.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                      return (
                        <>
                          <div className="hidden md:block text-right mr-10">
                            <div className="text-white text-sm">{dateStr}</div>
                            <div className="text-xs text-purple-300">{timeStr}</div>
                          </div>
                          <div className="hidden md:block text-right mr-10">
                            <div className="text-white text-sm">1 hour</div>
                            <div className="text-xs text-purple-300">Duration</div>
                          </div>
                        </>
                      );
                    })()}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/interviewer/feedback/${f.id}?mode=view`}>
                        View Details
                        <ArrowRight className='w-4 h-4 ml-1'/>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Paginator 
                page={page} 
                totalItems={pagination?.totalItems || 0}
                onPageChange={setPage} 
                pageSize={pageSize} 
              />
            </div>

            {!loading && (!feedbacks || feedbacks.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No feedbacks found</h3>
                <p className="text-purple-300">Once you submit feedbacks after sessions, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionHistory;