"use client"

import { useState, useEffect, useRef} from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { Upload, Plus, X,Loader2,FileText,Eye,ExternalLink} from "lucide-react"
import { getUserProfile,updateUserProfile,UserProfile } from "../../../services/userService"
import { useAuth } from "../../../hooks/useAuth"
import {toast} from 'sonner'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [resumeName, setResumeName] = useState<string | null>(null)

  const profilePictureRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile()
        setProfile(profileData)
        setName(profileData.name)
        setSkills(profileData.skills || [])
        setProfilePicturePreview(profileData.profilePicture || null)
        if (profileData.resume) {
          const urlParts = profileData.resume.split('/')
          const filename = urlParts[urlParts.length - 1]
          // If filename contains UUID or looks like an ID, use a generic name
          if (filename.length > 30 || filename.match(/^[a-f0-9-]{36}/)) {
            setResumeName('Resume.pdf')
          } else {
            setResumeName(filename || 'Resume.pdf')
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])



  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setProfilePicture(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePicturePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Please select an image file')
      }
    }
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setResume(file)
        setResumeName(file.name)
      } else {
        toast.error('Please select a PDF file')
      }
    }
  }

  const handleViewResume = () => {
    if (profile?.resume) {
      window.open(profile.resume, '_blank')
     }
   }

  const handleSaveChanges = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const updateData: {
        name?: string;
        skills?: string[];
        profilePicture?: File;
        resume?: File;
      } = {}
      
      // Only include changed fields
      if (name !== profile.name) {
        updateData.name = name
      }
      
      if (JSON.stringify(skills) !== JSON.stringify(profile.skills)) {
        updateData.skills = skills
      }
      
      if (profilePicture) {
        updateData.profilePicture = profilePicture
      }
      
      if (resume) {
        updateData.resume = resume
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await updateUserProfile(updateData)
        setProfile(updatedProfile)
        if (updatedProfile.profilePicture) {
          setProfilePicturePreview(updatedProfile.profilePicture)
        }

        setName(updatedProfile.name)
        setSkills(updatedProfile.skills || [])
        
        // Update resume name with saved resume
        if (updatedProfile.resume) {
          const urlParts = updatedProfile.resume.split('/')
          const filename = urlParts[urlParts.length - 1]
          if (filename.length > 30 || filename.match(/^[a-f0-9-]{36}/)) {
            setResumeName('Resume.pdf')
          } else {
            setResumeName(filename || 'Resume.pdf')
          }
        }
        toast.success('Profile updated successfully!')        
        // Reset file states
        setProfilePicture(null)
        setResume(null)
        if (profilePictureRef.current) profilePictureRef.current.value = ''
       if (resumeRef.current) resumeRef.current.value = ''
      } else {
        toast.info('No changes to save')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white flex items-center justify-center">
        <p>Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Profile Settings</h1>
            <p className="text-[#7D8590]">Manage your profile information and skills</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
                <CardHeader>
                  <CardTitle className="text-[#E6EDF3]">Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profilePicturePreview || undefined} />
                    <AvatarFallback className="bg-[#BC8CFF] text-white text-2xl">
                      {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    ref={profilePictureRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => profilePictureRef.current?.click()}
                    className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10 bg-transparent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  {profilePicture && (
                    <p className="text-[#7D8590] text-sm mt-2">New photo selected</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
                <CardHeader>
                  <CardTitle className="text-[#E6EDF3]">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E6EDF3]">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E6EDF3]">Email</label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] cursor-not-allowed"
                    />
                     <p className="text-[#7D8590] text-xs">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E6EDF3]">Resume</label>
                    <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        ref={resumeRef}
                        onChange={handleResumeChange}
                        accept=".pdf"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => resumeRef.current?.click()}
                        className="border-[#BC8CFF] text-[#BC8CFF] hover:bg-[#BC8CFF]/10 bg-transparent"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                      <span className="text-[#7D8590] text-sm">PDF format only</span>
                    </div>
                    {(resumeName || resume) && (
                      <div className="flex items-center justify-between mt-2 ml-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-[#BC8CFF]" />
                          <span className="text-[#E6EDF3] text-sm">
                            {resume ? resume.name : resumeName}
                            
                          </span>
                          {profile?.resume && !resume && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewResume}
                             className="border-[#3FB950] text-[#3FB950] hover:bg-[#3FB950]/10 bg-transparent p-1 h-6 w-6"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                          {resume && <span className="text-[#7D8590] text-xs">(New file selected)</span>}
                        </div>
                        
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
              <CardHeader>
                <CardTitle className="text-[#E6EDF3]">Skills</CardTitle>
                <p className="text-[#7D8590]">
                  Add your technical skills to help interviewers understand your expertise
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF]"
                    />
                    <Button
                      onClick={addSkill}
                      className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[#E6EDF3] font-semibold">Your Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="bg-[#BC8CFF]/20 text-[#BC8CFF] border border-[#BC8CFF]/30 hover:bg-[#BC8CFF]/30 transition-colors group"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-[#FF7B72] transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex justify-end"
          >
           <Button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-gradient-to-r from-[#3FB950] to-[#2EA043] hover:from-[#3FB950]/80 hover:to-[#2EA043]/80 text-white shadow-lg hover:shadow-[0_0_18px_rgba(63,185,80,0.5)] transition-all duration-300 mb-5" 
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
      
      <FloatingMascot />
    </div>
  )
}