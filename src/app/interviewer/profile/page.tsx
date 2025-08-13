"use client"

import { useState , useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, User, Code, Briefcase, Star, Upload,Loader2 ,Eye,FileText} from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { getInterviewerProfile,UpdateInterviewerProfile,InterviewerProfile,UpdateProfileData } from "../../../services/interviewerService";
import {toast} from 'sonner'

const Profile = () => {
    const [profile, setProfile] = useState<InterviewerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newLanguage, setNewLanguage] = useState("");

    const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    yearsOfExperience: 0,
    professionalBio: "",
    technicalSkills: [] as string[],
    hourlyRate:0
  });
  
  // File states
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getInterviewerProfile();
      setProfile(profileData);
      
      // Update form data
      setFormData({
        name: profileData.user.name,
        email: profileData.user.email,
        jobTitle: profileData.profile.jobTitle || "",
        yearsOfExperience: profileData.profile.yearsOfExperience || 0,
        professionalBio: profileData.profile.professionalBio || "",
        technicalSkills: profileData.profile.technicalSkills || [],
        hourlyRate:profileData.profile.hourlyRate||0
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.technicalSkills.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter(l => l !== language)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData: UpdateProfileData = {
        name: formData.name,
        jobTitle: formData.jobTitle,
        yearsOfExperience: formData.yearsOfExperience,
        professionalBio: formData.professionalBio,
        technicalSkills: formData.technicalSkills,
        hourlyRate: formData.hourlyRate
      };

      const files = {
        profilePic: profilePicFile || undefined,
        resume: resumeFile || undefined
      };

      const updatedProfile = await UpdateInterviewerProfile(updateData, files);
      setProfile(updatedProfile);
      
      // Reset file states
      setProfilePicFile(null);
      setResumeFile(null);
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
   } finally {
     setSaving(false);
    }
  };

  const handleViewResume = () => {
    if (profile?.profile.resume) {
       try {
        window.open(profile.profile.resume, '_blank');
      } catch (error) {
        console.error('Error opening resume:', error);
        toast.error('Unable to open resume. Please try again.');
      }
    } else {
      toast.error('No resume found');
     }
   };

  const stats = profile ? [
    { label: "Total Interviews", value: profile.user.totalSessions.toString(), icon: User },
    { label: "Status", value: profile.user.isApproved ? "Approved" : "Pending", icon: Star },
    { label: "Experience", value: `${profile.profile.yearsOfExperience || 0} years`, icon: Briefcase },
    { label: "Languages", value: formData.technicalSkills.length.toString(), icon: Code }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg relative flex items-center justify-center">
        <ParticleBackground />
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Profile Settings</h1>
          <p className="text-purple-300">Manage your professional profile and skills</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-futuristic hover-glow animate-scale-in rounded-2xl">
              <div className="p-6 text-center">
                <div className="mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-purple-400/50">
                  <AvatarImage src={profile?.profile.profilePic || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                      {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-white glow-text">{formData.name}</h3>
                  <p className="text-purple-300">{formData.jobTitle || 'Interviewer'}</p>
                  <p className="text-sm text-purple-300 mt-1">{formData.email}</p>
                </div>
                <div className="w-full mb-4 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="profile-pic-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full glass-effect border-purple-400/30 text-white hover:bg-purple-500/20"
                    onClick={() => document.getElementById('profile-pic-upload')?.click()}
                  >
                    {profile?.profile.profilePic ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {profilePicFile && (
                    <p className="text-xs text-green-400 text-center">
                      New photo selected: {profilePicFile.name}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-3 glass-card rounded-xl border border-purple-400/20">
                      <stat.icon className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                      <p className="text-xs text-purple-300">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
              <div className="p-6 h-[390px]">
                <div className="flex items-center mb-4">
                  <Upload className="w-6 h-6 text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gradient">Resume</h2>
                </div>
                <p className="text-purple-300 mb-6">Upload or update your resume</p>
                
                <div className="space-y-4">
                {profile?.profile.resume && (
                    <div className="glass-card border border-purple-400/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-purple-300">
                          <FileText className="w-4 h-4 mr-2" />
                          <div>
                            <span className="text-sm font-medium">Current Resume</span>
                            <p className="text-xs text-purple-400">Click view to open in new tab</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewResume}
                          className="glass-effect border-purple-400/30 text-purple-300 hover:bg-purple-500/20 h-8"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                  <Label htmlFor="resume" className="text-white font-medium">
                      {profile?.profile.resume ? 'Update Resume File (PDF/DOCX)' : 'Resume File (PDF/DOCX)'}
                    </Label>
                    <div className="relative">
                      <Input 
                        id="resume" 
                        type="file" 
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="glass-effect border-purple-400/30 text-white h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600/20 file:text-purple-300 hover:file:bg-purple-600/30 file:transition-colors" 
                      />
                    </div>
                    {resumeFile && (
                      <p className="text-xs text-green-400">
                        New file selected: {resumeFile.name}
                      </p>
                    )}
                  </div>
                  <div className="glass-card border border-purple-400/20 rounded-lg p-4">
                    <div className="flex items-center text-purple-300 text-sm">
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Supported formats: PDF, DOC, DOCX (Max size: 5MB)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gradient">Personal Information</h2>
                <p className="text-purple-300 mb-6">Update your personal details</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                     disabled
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400 opacity-60" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gradient">Professional Information</h2>
                <p className="text-purple-300 mb-6">Update your professional background</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience" className="text-white">Years of Experience</Label>
                    <Input 
                      id="yearsExperience" 
                      type="number" 
                     value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professionalBio" className="text-white">Professional Bio (minimum 100 words)</Label>
                    <Textarea 
                      id="professionalBio" 
                      rows={5}
                      value={formData.professionalBio}
                      onChange={(e) => handleInputChange('professionalBio', e.target.value)}
                      placeholder="Describe your professional background in at least 100 words..."
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400 resize-none"
                    />
                    <p className="text-xs text-purple-300">Minimum 100 words required</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-white">Hourly Rate</Label>
                    <Input 
                      id="hourlyRate" 

                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                      placeholder="Enter your hourly rate in Rs"
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400" 
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gradient">Technical Skills</h2>
                <p className="text-purple-300 mb-6">Add programming languages and technologies you can assess</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                  {formData.technicalSkills.map((language, index) => (
                      <Badge 
                        key={index} 
                        className="px-3 py-1 animate-scale-in hover-glow bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 rounded-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {language}
                        <button
                          onClick={() => removeLanguage(language)}
                          className="ml-2 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a language or technology"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                    <Button onClick={addLanguage} size="sm" className="glow-button border-0 hover:opacity-90">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex justify-end space-x-4">
            <Button 
                variant="outline" 
                className="glass-effect border-purple-400/30 text-white hover:bg-purple-500/20"
                onClick={loadProfile}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                className="glow-button border-0 hover:opacity-90"
                onClick={handleSave}
                disabled={saving}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;