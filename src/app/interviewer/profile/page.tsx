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
    const [nameError, setNameError] = useState<string | null>(null);
    const [jobTitleError, setJobTitleError] = useState<string | null>(null);
    const [yearsExperienceError, setYearsExperienceError] = useState<string | null>(null);
    const [professionalBioError, setProfessionalBioError] = useState<string | null>(null);
    const [skillError, setSkillError] = useState<string | null>(null);
    const [hourlyRateError, setHourlyRateError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    yearsOfExperience: "",
    professionalBio: "",
    technicalSkills: [] as string[],
    hourlyRate:500
  });
  
  // File states
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF or DOCX file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume file size must be less than 10MB');
        return;
      }
      setResumeFile(file);
    }
  };

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
        yearsOfExperience: profileData.profile.yearsOfExperience?.toString() || "",
        professionalBio: profileData.profile.professionalBio || "",
        technicalSkills: profileData.profile.technicalSkills || [],
        hourlyRate:profileData.profile.hourlyRate||500
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;

    const errors = validateSkill(trimmed);
    if (errors.length > 0) {
      setSkillError(errors[0]);
      return;
    }

    if (formData.technicalSkills.includes(trimmed)) {
      setSkillError("Skill already added");
      return;
    }

    setFormData(prev => ({
      ...prev,
      technicalSkills: [...prev.technicalSkills, trimmed]
    }));
    setNewLanguage("");
    setSkillError(null);
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

    // Validate based on field
    if (field === 'name') {
      const errors = validateName(value);
      setNameError(errors.length > 0 ? errors[0] : null);
    } else if (field === 'jobTitle') {
      const errors = validateJobTitle(value);
      setJobTitleError(errors.length > 0 ? errors[0] : null);
    } else if (field === 'yearsOfExperience') {
      const errors = validateYearsExperience(value);
      setYearsExperienceError(errors.length > 0 ? errors[0] : null);
    } else if (field === 'professionalBio') {
      const errors = validateProfessionalBio(value);
      setProfessionalBioError(errors.length > 0 ? errors[0] : null);
    } else if (field === 'hourlyRate') {
      const errors = validateHourlyRate(value);
      setHourlyRateError(errors.length > 0 ? errors[0] : null);
    }
  };

  const validateName = (name: string): string[] => {
    const errors: string[] = [];
    const trimmed = name.trim();
    if (trimmed !== name) errors.push("Name cannot start or end with spaces");
    if (/[^a-zA-Z\s]/.test(trimmed)) errors.push("Name cannot contain numbers or special characters");
    return errors;
  };

  const validateJobTitle = (title: string): string[] => {
    const errors: string[] = [];
    const trimmed = title.trim();
    if (trimmed !== title) errors.push("Job title cannot start or end with spaces");
    if (/[^a-zA-Z\s]/.test(trimmed)) errors.push("Job title cannot contain numbers or special characters");
    return errors;
  };

  const validateYearsExperience = (exp: string): string[] => {
    const errors: string[] = [];
    if (exp !== exp.trimStart() || exp !== exp.trimEnd()) errors.push("Experience cannot start or end with spaces");
    if (/[^0-9]/.test(exp)) errors.push("Experience can only contain numbers");
    const years = parseInt(exp) || 0;
    if (years > 50) errors.push("Years of experience cannot exceed 50");
    return errors;
  };

  const validateProfessionalBio = (bio: string): string[] => {
    const errors: string[] = [];
    const trimmed = bio.trim();
    if (trimmed !== bio) errors.push("Bio cannot start or end with spaces");
    if (/^\d+$/.test(trimmed)) errors.push("Bio cannot be only numbers");
    if (/[^a-zA-Z0-9\s]/.test(trimmed)) errors.push("Bio cannot contain special characters");
    return errors;
  };

  const validateSkill = (skill: string): string[] => {
    const errors: string[] = [];
    const trimmed = skill.trim();
    if (trimmed !== skill) errors.push("Skill cannot start or end with spaces");
    if (/^\d+$/.test(trimmed)) errors.push("Skill cannot be only numbers");
    if (/[^a-zA-Z0-9\s]/.test(trimmed)) errors.push("Skill cannot contain special characters");
    return errors;
  };

  const validateHourlyRate = (rate: number): string[] => {
    const errors: string[] = [];
    if (rate > 10000) errors.push("Hourly rate cannot be more than 10000");
    return errors;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push("Name is required");
    if (nameError) errors.push(nameError);
    if (!formData.jobTitle.trim()) errors.push("Job title is required");
    if (jobTitleError) errors.push(jobTitleError);
    if (!formData.yearsOfExperience.trim()) errors.push("Years of experience is required");
    if (yearsExperienceError) errors.push(yearsExperienceError);
    if (!formData.professionalBio.trim()) errors.push("Professional bio is required");
    if (professionalBioError) errors.push(professionalBioError);
    if (!Array.isArray(formData.technicalSkills) || formData.technicalSkills.length === 0) {
      errors.push("At least one technical skill is required");
    }
    if (formData.hourlyRate < 0 || formData.hourlyRate > 10000) {
      errors.push("Hourly rate must be between 0 and 10000");
    }
    if (hourlyRateError) errors.push(hourlyRateError);
    return errors;
  };


    
    

  const handleSave = async () => {
    try {
      setSaving(true);
      const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
      
      const updateData: UpdateProfileData = {
        name: formData.name,
        jobTitle: formData.jobTitle,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
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
      if (profilePicPreview) {
        URL.revokeObjectURL(profilePicPreview);
      }
      setProfilePicPreview(null);
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
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative flex items-center justify-center">
        <ParticleBackground />
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
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
                  <AvatarImage src={profilePicPreview || profile?.profile.profilePic || "/placeholder.svg"} alt="Profile" />
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
                    onChange={handleProfilePicUpload}
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
                        onChange={handleResumeUpload}
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
                      <span>Supported formats: PDF, DOC, DOCX (Max size: 10MB)</span>
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
                    {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
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
                    {jobTitleError && <p className="text-red-400 text-sm">{jobTitleError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience" className="text-white">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="text"
                     value={formData.yearsOfExperience}
                     onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                    {yearsExperienceError && <p className="text-red-400 text-sm">{yearsExperienceError}</p>}
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
                    {professionalBioError && <p className="text-red-400 text-sm">{professionalBioError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-white">Hourly Rate</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', Math.floor(Number(e.target.value) || 0))}
                      placeholder="Enter your hourly rate in Rs"
                      className="glass-effect border-purple-400/30 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                    {hourlyRateError && <p className="text-red-400 text-sm">{hourlyRateError}</p>}
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
                  {skillError && <p className="text-red-400 text-sm">{skillError}</p>}
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