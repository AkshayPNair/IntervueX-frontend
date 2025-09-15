'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fetchPendingInterviewers, approveInterviewer, rejectInterviewer, fetchAllUsers } from '@/services/adminService';
import { toast } from 'sonner'
import Paginator from '@/components/ui/paginator'
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Briefcase,
  Star,
  MapPin,
  Phone,
  Mail,
  Award,
  Code,
  Filter,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Building
} from 'lucide-react';

interface InterviewerApplication {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile: {
    profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
  } | null;
}



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export default function InterviewRequests() {
  const [applications, setApplications] = useState<InterviewerApplication[]>([]);
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [totalApplicationsCount, setTotalApplicationCount] = useState(0)

  const [selectedApplication, setSelectedApplication] = useState<InterviewerApplication | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [applicationToReject, setApplicationToReject] = useState<string | null>(null);
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);

  useEffect(() => {
    loadingPendingInterviewers();
  }, [])

  const loadingPendingInterviewers = async () => {
    try {
      setLoading(true)
      const [pendingData, allUsersData] = await Promise.all([
        fetchPendingInterviewers(),
        fetchAllUsers()
      ])

      const interviewers = allUsersData.filter((user: any) => user.role === 'interviewer' || user.role === 'Interviewer')
      const approved = interviewers.filter((user: any) => user.isApproved).length
      const total = interviewers.length
      const rejected = Math.max(0, total - approved - pendingData.length)

      setApplications(pendingData)
      setApprovedCount(approved)
      setRejectedCount(rejected)
      setTotalApplicationCount(total)
    } catch (error) {
      console.error("Error fetching pending interviewers : ", error)
      toast.error('Failed to load pending interviewers')
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.profile?.jobTitle && app.profile.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch;
  });

  // Pagination (same style as admin user listing)
  const [page, setPage] = useState(1);
  const pageSize = 3;
  useEffect(() => { setPage(1); }, [searchTerm, applications]);
  const totalItems = filteredApplications.length;
  const pagedApplications = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, page, pageSize]);

  const handleApprove = async (applicationId: string) => {
    try {
      await approveInterviewer(applicationId)
      toast.success("Interviewer approved successfully")
      setApplications(applications.filter(app => app.id !== applicationId));
      setApprovedCount(prev => prev + 1)
    } catch (error) {
      console.error("Error approving interviewer:", error)
      toast.error("Failed to approve interviewer")
    }
  };

  const handleReject = (applicationId: string) => {
    setApplicationToReject(applicationId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!applicationToReject || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsConfirmingReject(true);
    try {
      await rejectInterviewer(applicationToReject, rejectionReason);
      toast.success('Interviewer rejected successfully');
      setApplications(applications.filter(app => app.id !== applicationToReject));
      setRejectedCount(prev => prev + 1);

      // Reset modal state
      setShowRejectModal(false);
      setRejectionReason('');
      setApplicationToReject(null);
    } catch (error) {
      console.error('Error rejecting interviewer:', error);
      toast.error('Failed to reject interviewer');
    } finally {
      setIsConfirmingReject(false);
    }
  };

  const cancelReject = () => {
    if (isConfirmingReject) return; // Prevent closing while processing
    setShowRejectModal(false);
    setRejectionReason('');
    setApplicationToReject(null);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showRejectModal) {
        if (e.key === 'Escape' && !isConfirmingReject) {
          cancelReject();
        } else if (e.key === 'Enter' && e.ctrlKey && rejectionReason.trim() && !isConfirmingReject) {
          confirmReject();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showRejectModal, rejectionReason, isConfirmingReject]);

  const handleViewProfile = (application: InterviewerApplication) => {
    setSelectedApplication(application);
    setShowProfile(true);
  };

  const handleViewResume = (application: InterviewerApplication) => {
    setSelectedApplication(application);
    setShowResume(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Approved':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'Rejected':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { label: 'Junior', color: 'bg-blue-500/20 text-blue-400' };
    if (years < 5) return { label: 'Mid-Level', color: 'bg-purple-500/20 text-purple-400' };
    if (years < 8) return { label: 'Senior', color: 'bg-green-500/20 text-green-400' };
    return { label: 'Expert', color: 'bg-yellow-500/20 text-yellow-400' };
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Interviewer Applications</h1>
          <p className="text-gray-400 mt-1">Review and approve interviewer applications</p>
        </div>
        <motion.div
          className="flex items-center space-x-4 glass-card-light rounded-lg px-4 py-2"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm text-gray-300">
            {applications.length} pending review
          </span>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div
          className="stat-card-glow rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center pulse-glow">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-white glow-text">
                {applications.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="stat-card-glow rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center pulse-glow">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-white glow-text">
                {approvedCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="stat-card-glow rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center pulse-glow">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-white glow-text">
                {rejectedCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="stat-card-glow rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center pulse-glow">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-white glow-text">{totalApplicationsCount}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="glass-card rounded-xl p-6"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
            <motion.input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 input-glow rounded-lg text-white placeholder-gray-400 focus:outline-none"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          <div className="flex items-center space-x-2 px-4 py-3 glass-card-light rounded-lg">
            <Filter className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Showing: Pending Applications Only</span>
          </div>
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
            <p className="text-gray-400">There are no interviewer applications pending review at the moment.</p>
          </div>
        ) : (
          pagedApplications.map((application, index) => (
            <motion.div
              key={application.id}
              className="glass-card rounded-xl p-6"
              variants={itemVariants}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {application.profile?.profilePic ? (
                        <img
                          src={application.profile.profilePic}
                          alt={`${application.name}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${application.profile?.profilePic ? 'hidden' : 'flex'}`}>
                        {application.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{application.name}</h3>
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          Pending
                        </span>
                      </div>
                      <p className="text-purple-300 font-medium">{application.profile?.jobTitle || 'Not specified'}</p>
                      <p className="text-gray-400 text-sm">{application.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="glass-card-light rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Experience</span>
                      </div>
                      <p className="text-white font-medium">{application.profile?.yearsOfExperience || 0} years</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg mt-1 ${getExperienceLevel(application.profile?.yearsOfExperience || 0).color}`}>
                        {getExperienceLevel(application.profile?.yearsOfExperience || 0).label}
                      </span>
                    </div>

                    <div className="glass-card-light rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Contact</span>
                      </div>
                      <p className="text-white font-medium text-sm">{application.email}</p>
                    </div>

                    <div className="glass-card-light rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Resume</span>
                      </div>
                      {application.profile?.resume ? (
                        <div>
                          <p className="text-white font-medium text-sm">Resume uploaded</p>
                          <a
                            href={application.profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No resume uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.profile?.technicalSkills ? (
                        <>
                          {application.profile.technicalSkills.slice(0, 6).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.profile.technicalSkills.length > 6 && (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-lg">
                              +{application.profile.technicalSkills.length - 6} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">No skills specified</span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-300">
                    <p className="line-clamp-2">{application.profile?.professionalBio}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-500/20">
                    <div className="text-sm text-gray-400">
                      Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-yellow-400">
                      Status: Pending Review
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2 ml-6">
                  <motion.button
                    onClick={() => handleViewProfile(application)}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="View Full Profile"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="w-5 h-5" />
                    <span>View</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Profile Modal */}
      {showProfile && selectedApplication && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowProfile(false)}
        >
          <motion.div
            className="glass-card rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Interviewer Application Profile</h2>
              <motion.button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XCircle className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                  {selectedApplication.profile?.profilePic ? (
                    <img
                      src={selectedApplication.profile.profilePic}
                      alt={`${selectedApplication.name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${selectedApplication.profile?.profilePic ? 'hidden' : 'flex'}`}>
                    {selectedApplication.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-semibold text-white">{selectedApplication.name}</h3>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Pending
                    </span>
                  </div>
                  <p className="text-purple-300 font-medium text-lg">{selectedApplication.profile?.jobTitle || 'Not specified'}</p>
                  <p className="text-gray-400">{selectedApplication.email}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-lg ${getExperienceLevel(selectedApplication.profile?.yearsOfExperience || 0).color}`}>
                      {selectedApplication.profile?.yearsOfExperience || 0} years • {getExperienceLevel(selectedApplication.profile?.yearsOfExperience || 0).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card-light rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Email</span>
                    </div>
                    <p className="text-white">{selectedApplication.email}</p>
                  </div>

                  <div className="glass-card-light rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Applied Date</span>
                    </div>
                    <p className="text-white">{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="glass-card-light rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Experience</span>
                    </div>
                    <p className="text-white">{selectedApplication.profile?.yearsOfExperience || 0} years</p>
                  </div>

                  <div className="glass-card-light rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Job Title</span>
                    </div>
                    <p className="text-white">{selectedApplication.profile?.jobTitle || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Bio */}
              {selectedApplication.profile?.professionalBio && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Professional Bio</h4>
                  <div className="glass-card-light rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">{selectedApplication.profile.professionalBio}</p>
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Technical Skills</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedApplication.profile?.technicalSkills ? (
                    selectedApplication.profile.technicalSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg border border-purple-500/30 font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No skills specified</span>
                  )}
                </div>
              </div>

              {/* Resume Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Resume</h4>
                <div className="glass-card-light rounded-lg p-4">
                  {selectedApplication.profile?.resume ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Resume uploaded</p>
                          <p className="text-gray-400 text-sm">
                            Uploaded on {new Date(selectedApplication.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => window.open(selectedApplication.profile?.resume, '_blank')}
                          className="glow-button text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                        <motion.button
                          onClick={() => window.open(selectedApplication.profile?.resume, '_blank')}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:from-blue-600 hover:to-cyan-600 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">No resume uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Application Status</h4>
                <div className="glass-card-light rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-white">{new Date(selectedApplication.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Application ID:</span>
                    <span className="text-white font-mono text-sm">{selectedApplication.id}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <motion.button
                  onClick={() => {
                    handleApprove(selectedApplication.id);
                    setShowProfile(false);
                  }}
                  className="flex-1 glow-button text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Application</span>
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleReject(selectedApplication.id);
                    setShowProfile(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-red-600 hover:to-rose-600 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject Application</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Resume Viewer Modal */}
      {showResume && selectedApplication && selectedApplication.profile?.resume && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowResume(false)}
        >
          <motion.div
            className="glass-card rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">Resume Viewer</h2>
                <p className="text-gray-400">{selectedApplication.name}'s Resume</p>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => window.open(selectedApplication.profile?.resume, '_blank')}
                  className="glow-button text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
                <motion.button
                  onClick={() => setShowResume(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XCircle className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-lg h-[70vh] flex items-center justify-center">
              <div className="text-center text-gray-600">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Resume Preview</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedApplication.name}'s Resume
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  In a real application, this would show the actual PDF/DOCX content
                </p>
                <motion.button
                  onClick={() => window.open(selectedApplication.profile?.resume, '_blank')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Open in New Tab
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cancelReject}
        >
          <motion.div
            className="glass-card rounded-xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Reject Application</h2>
              <p className="text-gray-400">
                Please provide a reason for rejecting this interviewer application.
              </p>
            </div>

            <div className="space-y-4">
              {/* Quick Rejection Reasons */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Quick Select Reason
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Insufficient experience for the role",
                    "Technical skills don't match requirements",
                    "Incomplete application or missing documents",
                    "Professional background doesn't align with our needs",
                    "Resume quality needs improvement"
                  ].map((reason, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setRejectionReason(reason)}
                      className="text-left px-3 py-2 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {reason}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this application is being rejected..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500">
                      This reason will be shown to the interviewer
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Press Ctrl+Enter to submit, Esc to cancel
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">                    {rejectionReason.length}/500
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <motion.button
                  onClick={cancelReject}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim() || isConfirmingReject}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: rejectionReason.trim() && !isConfirmingReject ? 1.02 : 1 }}
                  whileTap={{ scale: rejectionReason.trim() && !isConfirmingReject ? 0.98 : 1 }}
                >
                  {isConfirmingReject ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Reject Application</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <div className="mt-6 flex justify-center">
        <Paginator
          page={page}
          totalItems={totalItems}
          onPageChange={setPage}
          pageSize={pageSize}
        />
      </div>

    </motion.div>
  );
}