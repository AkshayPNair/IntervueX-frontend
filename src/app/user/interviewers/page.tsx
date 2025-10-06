"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAllInterviewers, InterviewerProfile } from "../../../services/userService"
import { useDebounce } from "../../../hooks/useDebounce"
import Paginator from "../../../components/ui/paginator"
import { toast } from 'sonner'
import {
  Search,
  Building,
  Star,
  Plus,
  User,
  Clock,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterState {
  rating: [number, number]
  hourlyRate: [number, number]
  skills: string[]
}

export default function InterviewersPage() {
  const router = useRouter()
  const [interviewers, setInterviewers] = useState<InterviewerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    rating: [0, 5],
    hourlyRate: [0, 10000],
    skills: []
  })

  // Get unique skills from all interviewers
  const allSkills = Array.from(
    new Set(
      interviewers.flatMap(interviewer => interviewer.technicalSkills || [])
    )
  ).sort()

  const fetchInterviewers = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true)
      const data = await getAllInterviewers(searchQuery)
      setInterviewers(data)

      // Set initial filter ranges based on data
      if (data.length > 0) {
        const rates = data.map(i => i.hourlyRate || 0)
        const minRate = Math.min(...rates)
        const maxRate = Math.max(...rates)

        setFilters(prev => ({
          ...prev,
          hourlyRate: [minRate, maxRate]
        }))
      }
    } catch (error) {
      console.error('Error fetching interviewers:', error)
      toast.error('Failed to load interviewers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterviewers()
  }, [fetchInterviewers])

  useEffect(() => {
    if (debouncedSearchQuery !== "") {
      fetchInterviewers(debouncedSearchQuery)
    } else {
      fetchInterviewers()
    }
  }, [debouncedSearchQuery, fetchInterviewers])

  const applyFilters = (interviewer: InterviewerProfile) => {
    // Rating filter
    const rating = interviewer.rating || 4.5
    if (rating < filters.rating[0] || rating > filters.rating[1]) {
      return false
    }

    // Hourly rate filter
    const hourlyRate = interviewer.hourlyRate || 0
    if (hourlyRate < filters.hourlyRate[0] || hourlyRate > filters.hourlyRate[1]) {
      return false
    }

    // Skills filter
    if (filters.skills.length > 0) {
      const interviewerSkills = interviewer.technicalSkills || []
      const hasMatchingSkill = filters.skills.some(skill => 
        interviewerSkills.some(interviewerSkill => 
          interviewerSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
      if (!hasMatchingSkill) {
        return false
      }
    }

    return true
  }

  const filteredInterviewers = useMemo(() => {
    return interviewers.filter(applyFilters);
  }, [interviewers, filters]);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => { setPage(1); }, [debouncedSearchQuery, filters, interviewers]);
  const totalItems = filteredInterviewers.length;
  const pagedInterviewers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInterviewers.slice(start, start + pageSize);
  }, [filteredInterviewers, page]);

  const clearFilters = () => {
    
    const rates = interviewers.map(i => i.hourlyRate || 0)
    const minRate = Math.min(...rates)
    const maxRate = Math.max(...rates)
    
    setFilters({
      rating: [0, 5],
      hourlyRate: [minRate, maxRate],
      skills: []
    })
  }

  const hasActiveFilters = () => {
    const rates = interviewers.map(i => i.hourlyRate || 0)
    const minRate = Math.min(...rates)
    const maxRate = Math.max(...rates)
    
    return (
      filters.rating[0] > 0 || 
      filters.rating[1] < 5 ||
      filters.hourlyRate[0] > minRate ||
      filters.hourlyRate[1] < maxRate ||
      filters.skills.length > 0
    )
  }

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
                
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10 bg-transparent relative ${
                        hasActiveFilters() ? 'bg-[#BC8CFF]/20' : ''
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      {hasActiveFilters() && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#BC8CFF] rounded-full"></div>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-[#E6EDF3]">Filter Interviewers</DialogTitle>
                      <DialogDescription className="text-[#7D8590]">
                        Narrow down your search by rating, hourly rate, and skills.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Rating Filter */}
                      <div className="space-y-3">
                        <Label className="text-[#E6EDF3] font-medium">Rating Range</Label>
                        <div className="px-2">
                          <Slider
                            value={filters.rating}
                            onValueChange={(value) => setFilters({...filters, rating: value as [number, number]})}
                            max={5}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-[#7D8590] mt-1">
                            <span>{filters.rating[0]}★</span>
                            <span>{filters.rating[1]}★</span>
                          </div>
                        </div>
                      </div>

                      {/* Hourly Rate Filter */}
                      <div className="space-y-3">
                        <Label className="text-[#E6EDF3] font-medium">Hourly Rate (₹)</Label>
                        <div className="px-2">
                          <Slider
                            value={filters.hourlyRate}
                            onValueChange={(value) => setFilters({...filters, hourlyRate: value as [number, number]})}
                            max={interviewers.length > 0 ? Math.max(...interviewers.map(i => i.hourlyRate || 0)) : 10000}
                            min={interviewers.length > 0 ? Math.min(...interviewers.map(i => i.hourlyRate || 0)) : 0}
                            step={100}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-[#7D8590] mt-1">
                            <span>₹{filters.hourlyRate[0]}</span>
                            <span>₹{filters.hourlyRate[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills Filter */}
                      <div className="space-y-3">
                        <Label className="text-[#E6EDF3] font-medium">Technical Skills</Label>
                        <div className="max-h-48 overflow-y-auto space-y-2 border border-[#30363D] rounded-lg p-3 bg-[#161B22]/50">
                          {allSkills.map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={skill}
                                checked={filters.skills.includes(skill)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFilters({...filters, skills: [...filters.skills, skill]})
                                  } else {
                                    setFilters({...filters, skills: filters.skills.filter(s => s !== skill)})
                                  }
                                }}
                                className="border-[#30363D] data-[state=checked]:bg-[#BC8CFF] data-[state=checked]:border-[#BC8CFF]"
                              />
                              <Label htmlFor={skill} className="text-sm text-[#E6EDF3] cursor-pointer">
                                {skill}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {filters.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {filters.skills.map((skill) => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className="border-[#BC8CFF] text-[#BC8CFF] text-xs"
                              >
                                {skill}
                                <button
                                  onClick={() => setFilters({...filters, skills: filters.skills.filter(s => s !== skill)})}
                                  className="ml-1 hover:text-red-400"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="border-[#7D8590] text-[#7D8590] hover:bg-[#30363D]/50 bg-transparent"
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={() => setIsFilterOpen(false)}
                        className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80"
                      >
                        Apply Filters
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-[#7D8590] text-sm">Active filters:</span>
                {(filters.rating[0] > 0 || filters.rating[1] < 5) && (
                  <Badge variant="outline" className="border-[#BC8CFF] text-[#BC8CFF] text-xs">
                    Rating: {filters.rating[0]}★ - {filters.rating[1]}★
                    <button
                      onClick={() => setFilters({...filters, rating: [0, 5]})}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="border-[#BC8CFF] text-[#BC8CFF] text-xs">
                    {skill}
                    <button
                      onClick={() => setFilters({...filters, skills: filters.skills.filter(s => s !== skill)})}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-[#7D8590] hover:text-[#E6EDF3] text-xs p-1"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-[#7D8590]">Loading interviewers...</div>
                </div>
            ) : filteredInterviewers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-[#7D8590] text-lg mb-2">No interviewers found</div>
                <div className="text-[#7D8590] text-sm">
                  {searchQuery || hasActiveFilters() ? 
                    `No results for your search criteria` : 
                    "No interviewers available"
                  }
                </div>
                {(searchQuery || hasActiveFilters()) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      clearFilters()
                    }}
                    className="mt-4 border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10 bg-transparent"
                  >
                    Clear search and filters
                  </Button>
                )}
              </div>  
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedInterviewers.map((interviewer, index) => (
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
                            <div className="text-[#BC8CFF] font-semibold">₹ {interviewer.hourlyRate}/hr</div>
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
                                router.push(`/user/book-session/${interviewer.id}`)
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
                <div className="mt-6 flex justify-center">
                  <Paginator 
                    page={page} 
                    totalItems={totalItems} 
                    onPageChange={setPage} 
                    pageSize={pageSize} 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}