"use client"

import { useState, useEffect } from "react";
import { Camera, Upload, User, Briefcase, Award, FileText, CheckCircle, Clock, X, Plus, ChevronLeft, ChevronRight, XCircle,AlertTriangle } from "lucide-react";
import { submitVerification, VerificationData, getVerificationStatus, VerificationStatusData } from "../../../services/interviewerService";
import { useRouter } from "next/navigation"
import {toast} from 'sonner'

const InterviewerVerification = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        profilePicture: null as File | null,
        jobTitle: "",
        yearsExperience: "",
        professionalBio: "",
        technicalSkills: [] as string[],
        resumeFile: null as File | null
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [currentSkill, setCurrentSkill] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatusData | null>(null)
    const [loading, setLoading] = useState(true)
    const [jobTitleError, setJobTitleError] = useState<string | null>(null)
    const [yearsExperienceError, setYearsExperienceError] = useState<string | null>(null)
    const [professionalBioError, setProfessionalBioError] = useState<string | null>(null)
    const [skillError, setSkillError] = useState<string | null>(null)

    useEffect(() => {
        const checkVerificationStatus = async () => {
            try {
                const status = await getVerificationStatus()
                console.log('Verification status received:', status) 
                setVerificationStatus(status)
                if (status.hasSubmittedVerification) {
                    setIsSubmitted(true)
                }
            } catch (error) {
                console.error('Error checking verification status:', error)
            } finally {
                setLoading(false)
            }
        }
        checkVerificationStatus()
    }, [])


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate based on field
        if (field === 'jobTitle') {
            const errors = validateJobTitle(value);
            setJobTitleError(errors.length > 0 ? errors[0] : null);
        } else if (field === 'yearsExperience') {
            const errors = validateYearsExperience(value);
            setYearsExperienceError(errors.length > 0 ? errors[0] : null);
        } else if (field === 'professionalBio') {
            const errors = validateProfessionalBio(value);
            setProfessionalBioError(errors.length > 0 ? errors[0] : null);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image file size must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, profilePicture: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a PDF or DOCX file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Resume file size must be less than 10MB');
                return;
            }
            setFormData(prev => ({ ...prev, resumeFile: file }));
        }
    };

    const addSkill = () => {
        const trimmed = currentSkill.trim()
        if (!trimmed) return

        const errors = validateSkill(trimmed)
        if (errors.length > 0) {
            setSkillError(errors[0])
            return
        }

        if (formData.technicalSkills.includes(trimmed)) {
            setSkillError("Skill already added")
            return
        }

        setFormData(prev => ({
            ...prev,
            technicalSkills: [...prev.technicalSkills, trimmed]
        }));
        setCurrentSkill("");
        setSkillError(null)
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const verificationData: VerificationData = {
                profilePicture: formData.profilePicture,
                jobTitle: formData.jobTitle,
                yearsExperience: formData.yearsExperience,
                professionalBio: formData.professionalBio,
                technicalSkills: formData.technicalSkills,
                resumeFile: formData.resumeFile
            };
            await submitVerification(verificationData);
            const updatedStatus = await getVerificationStatus();
            setVerificationStatus(updatedStatus);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error('Verification submission error:', error);
            setSubmitError(error.response?.data?.error || 'Failed to submit verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateJobTitle = (title: string): string[] => {
        const errors: string[] = [];
        const trimmed = title.trim();
        if (trimmed !== title) errors.push("Job title cannot start or end with spaces");
        if (/^\d+$/.test(trimmed)) errors.push("Job title cannot be only numbers");
        if (/[^a-zA-Z\s]/.test(trimmed)) errors.push("Job title cannot contain special characters or numbers");
        return errors;
    };

    const validateYearsExperience = (exp: string): string[] => {
        const errors: string[] = [];
        if (exp !== exp.trimStart()) errors.push("Experience cannot start with spaces");
        if (/[^0-9]/.test(exp)) errors.push("Experience can only contain numbers");
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
        if (/^\d+$/.test(trimmed)) errors.push("Skill cannot be only numbers");
        if (/[^a-zA-Z0-9\s]/.test(trimmed)) errors.push("Skill cannot contain special characters");
        return errors;
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.profilePicture !== null;
            case 2:
                return formData.jobTitle && !jobTitleError && formData.yearsExperience && !yearsExperienceError && formData.professionalBio.length >= 100 && !professionalBioError;
            case 3:
                return formData.technicalSkills.length > 0;
            case 4:
                return formData.resumeFile !== null;
            default:
                return false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
                <div className="particle-container">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="floating-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 6}s`,
                                animationDuration: `${6 + Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>
                <main className="container mx-auto px-6 py-20 relative z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
                </main>
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
                {/* Particle Background */}
                <div className="particle-container">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="floating-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 6}s`,
                                animationDuration: `${6 + Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>



                <main className="container mx-auto px-6 py-20 relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="card-futuristic hover-glow animate-scale-in rounded-2xl p-12">
                            <div className="mb-8">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse-glow ${
                                    verificationStatus?.isApproved 
                                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                                        : verificationStatus?.isRejected
                                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                                            : 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                }`}>
                                    {verificationStatus?.isApproved ? (
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    ) : verificationStatus?.isRejected ? (
                                        <XCircle className="w-10 h-10 text-white" />
                                    ) : (
                                        <Clock className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold mb-4 text-gradient">
                                    {verificationStatus?.isApproved 
                                        ? 'Application Approved!'
                                        : verificationStatus?.isRejected
                                            ? 'Application Reviewed'
                                            : 'Application Submitted!'
                                    }
                                </h1>
                                <p className="text-purple-300 text-lg mb-8">
                                    {verificationStatus?.isApproved
                                        ? 'Congratulations! Your interviewer application has been approved. You now have full access to the platform.'
                                        : verificationStatus?.isRejected
                                            ? 'Your interviewer application has been reviewed. Please see the details below and consider reapplying after addressing the feedback.'
                                            : 'Thank you for submitting your interviewer verification application. Our admin team will review your details and get back to you soon.'
                                    }
                                </p>
                            </div>

                            <div className="glass-card rounded-xl p-6 mb-8">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    {verificationStatus?.isApproved ? (
                                        <>
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                            <span className="text-xl font-semibold text-white">Status: Approved</span>
                                        </>
                                        ) : verificationStatus?.isRejected ? (
                                        <>
                                            <XCircle className="w-6 h-6 text-red-400" />
                                            <span className="text-xl font-semibold text-white">Status: Rejected</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-6 h-6 text-yellow-400" />
                                            <span className="text-xl font-semibold text-white">Status: Pending Review</span>
                                        </>
                                    )}
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className={`${
                                        verificationStatus?.isApproved 
                                            ? 'bg-green-400 w-full' 
                                            : verificationStatus?.isRejected 
                                                ? 'bg-red-400 w-full' 
                                                : 'bg-gradient-to-r from-yellow-400 to-orange-500 w-1/3'
                                    } h-2 rounded-full animate-pulse`}></div>
                                </div>
                                <p className="text-purple-300 text-sm mt-3">
                                    {verificationStatus?.isApproved
                                        ? 'Congratulations! You now have full access to all interviewer features.'
                                        : verificationStatus?.isRejected
                                            ? 'Your application has been reviewed and unfortunately was not approved at this time.'
                                            : 'Estimated review time: 1-2 business days'
                                    }
                                </p>

                                {verificationStatus?.isRejected && verificationStatus?.rejectedReason && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-red-300 font-medium mb-1">Reason for Rejection:</p>
                                                <p className="text-red-200 text-sm">{verificationStatus.rejectedReason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 text-left">
                                <h3 className="text-xl font-semibold text-gradient text-center mb-4">
                                    {verificationStatus?.isRejected ? "What Can You Do?" : "What's Next?"}
                                </h3>
                                <div className="space-y-3">
                                {verificationStatus?.isRejected ? (
                                        // Rejected application steps
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-red-400 text-sm font-semibold">1</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Review Feedback</p>
                                                    <p className="text-purple-300 text-sm">Carefully read the rejection reason provided above</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-red-400 text-sm font-semibold">2</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Improve Your Profile</p>
                                                    <p className="text-purple-300 text-sm">Address the concerns mentioned in the feedback</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-red-400 text-sm font-semibold">3</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Reapply Later</p>
                                                    <p className="text-purple-300 text-sm">You can submit a new application after making improvements</p>
                                                </div>
                                            </div>
                                        </>
                                   ) : (
                                        // Pending/Approved application steps
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-purple-400 text-sm font-semibold">1</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Application Review</p>
                                                    <p className="text-purple-300 text-sm">Our team will verify your credentials and experience</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-purple-400 text-sm font-semibold">2</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Email Notification</p>
                                                    <p className="text-purple-300 text-sm">You'll receive an email with the verification results</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <span className="text-purple-400 text-sm font-semibold">3</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">Platform Access</p>
                                                    <p className="text-purple-300 text-sm">Once approved, you'll have full access to all interviewer features</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-purple-400/20">
                                {verificationStatus?.isApproved && (
                                    <button
                                        onClick={() => router.push('/interviewer/dashboard')}
                                        className="w-full glow-button border-0 hover:scale-105 transition-transform rounded-xl py-3 mb-4"
                                    >
                                        Go to Dashboard
                                    </button>
                                )}

                                 {verificationStatus?.isRejected && (
                                    <button
                                        onClick={() => {
                                            // Reset the form and allow reapplication
                                            setIsSubmitted(false);
                                            setCurrentStep(1);
                                            setFormData({
                                                profilePicture: null,
                                                jobTitle: "",
                                                yearsExperience: "",
                                                professionalBio: "",
                                                technicalSkills: [],
                                                resumeFile: null
                                            });
                                            setProfilePreview(null);
                                            setVerificationStatus(prev => prev ? {
                                                ...prev,
                                                isRejected: false,
                                                rejectedReason: undefined
                                            } : null);
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 mb-4"
                                    >
                                        Submit New Application
                                    </button>
                                )}
                                <p className="text-purple-300 text-sm">
                                    Questions? Contact our support team at{" "}
                                    <a href="mailto:support@interviewpro.com" className="text-purple-400 hover:text-purple-300 underline">
                                        support@interviewpro.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg relative">
            {/* Particle Background */}
            <div className="particle-container">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="floating-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 6}s`,
                            animationDuration: `${6 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            <main className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8 animate-fade-in">
                        <h1 className="text-3xl font-bold mb-4 text-gradient">Interviewer Verification</h1>
                        <p className="text-lg text-purple-300 max-w-2xl mx-auto">
                            Complete your professional profile to get verified as an interviewer.
                            Our admin team will review your application within 1-2 business days.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4 mb-6">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step <= currentStep
                                        ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
                                        : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <div className={`w-12 h-0.5 mx-2 transition-all ${step < currentStep ? 'bg-purple-600' : 'bg-purple-500/20'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <p className="text-purple-300 text-sm">
                                Step {currentStep} of 4: {
                                    currentStep === 1 ? 'Profile Picture' :
                                        currentStep === 2 ? 'Professional Information' :
                                            currentStep === 3 ? 'Technical Skills' :
                                                'Resume Upload'
                                }
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="card-futuristic hover-glow animate-fade-in rounded-2xl">
                            <div className="p-8">
                                {/* Step 1: Profile Picture */}
                                {currentStep === 1 && (
                                    <div>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Camera className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gradient">Profile Picture</h2>
                                                <p className="text-purple-300">Upload a professional headshot</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center space-y-6">
                                            <div className="w-40 h-40 bg-purple-500/10 border-2 border-dashed border-purple-400/30 rounded-full flex items-center justify-center overflow-hidden">
                                                {profilePreview ? (
                                                    <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-16 h-16 text-purple-400" />
                                                )}
                                            </div>

                                            <label htmlFor="profilePicture" className="cursor-pointer w-full max-w-md">
                                                <div className="glass-effect border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-colors">
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <Upload className="w-5 h-5 text-purple-400" />
                                                        <span className="text-white font-medium">
                                                            {formData.profilePicture ? formData.profilePicture.name : "Click to upload or drag and drop"}
                                                        </span>
                                                    </div>
                                                    <p className="text-purple-300 text-sm text-center mt-2">
                                                        PNG, JPG or WebP (max. 5MB)
                                                    </p>
                                                </div>
                                                <input
                                                    id="profilePicture"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Professional Information */}
                                {currentStep === 2 && (
                                    <div>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Briefcase className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gradient">Professional Information</h2>
                                                <p className="text-purple-300">Tell us about your professional background</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label htmlFor="jobTitle" className="text-white font-medium flex items-center space-x-2">
                                                        <span>Job Title</span>
                                                        <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        id="jobTitle"
                                                        type="text"
                                                        required
                                                        value={formData.jobTitle}
                                                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                                                        placeholder="e.g., Senior Software Engineer"
                                                        className="w-full px-4 py-3 glass-effect border border-purple-400/30 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-400 focus:outline-none transition-colors"
                                                    />
                                                    {jobTitleError && <p className="text-red-500 text-sm mt-1">{jobTitleError}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="yearsExperience" className="text-white font-medium flex items-center space-x-2">
                                                        <span>Years of Experience</span>
                                                        <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        id="yearsExperience"
                                                        type="text"
                                                        required
                                                        value={formData.yearsExperience}
                                                        onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                                                        placeholder="e.g., 5"
                                                        className="w-full px-4 py-3 glass-effect border border-purple-400/30 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-400 focus:outline-none transition-colors"
                                                    />
                                                    {yearsExperienceError && <p className="text-red-500 text-sm mt-1">{yearsExperienceError}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="professionalBio" className="text-white font-medium flex items-center space-x-2">
                                                    <span>Professional Bio</span>
                                                    <span className="text-red-400">*</span>
                                                </label>
                                                <textarea
                                                    id="professionalBio"
                                                    required
                                                    rows={6}
                                                    value={formData.professionalBio}
                                                    onChange={(e) => handleInputChange("professionalBio", e.target.value)}
                                                    placeholder="Tell us about your professional background, expertise, and what makes you a great interviewer..."
                                                    className="w-full px-4 py-3 glass-effect border border-purple-400/30 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                                                />
                                                {professionalBioError && <p className="text-red-500 text-sm mt-1">{professionalBioError}</p>}
                                                <p className="text-purple-300 text-sm">
                                                    {formData.professionalBio.length}/100 characters minimum
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Technical Skills */}
                                {currentStep === 3 && (
                                    <div>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Award className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gradient">Technical Skills</h2>
                                                <p className="text-purple-300">Add your technical expertise areas</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="skillInput" className="text-white font-medium flex items-center space-x-2">
                                                    <span>Add Technical Skills</span>
                                                    <span className="text-red-400">*</span>
                                                </label>
                                                <div className="flex space-x-2">
                                                    <input
                                                        id="skillInput"
                                                        type="text"
                                                        value={currentSkill}
                                                        onChange={(e) => {
                                                            setCurrentSkill(e.target.value);
                                                            setSkillError(null);
                                                        }}
                                                        onKeyPress={handleKeyPress}
                                                        placeholder="e.g., JavaScript, React, Python..."
                                                        className="flex-1 px-4 py-3 glass-effect border border-purple-400/30 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-400 focus:outline-none transition-colors"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addSkill}
                                                        disabled={!currentSkill.trim()}
                                                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors flex items-center space-x-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>Add</span>
                                                    </button>
                                                </div>
                                                {skillError && <p className="text-red-500 text-sm mt-1">{skillError}</p>}
                                                <p className="text-purple-300 text-sm">
                                                    Press Enter or click Add to add a skill. Include programming languages, frameworks, tools, and methodologies.
                                                </p>
                                            </div>

                                            {formData.technicalSkills.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-white font-medium">Your Skills</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.technicalSkills.map((skill, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-purple-600/20 border border-purple-400/30 px-3 py-1 rounded-full flex items-center space-x-2 group"
                                                            >
                                                                <span className="text-white text-sm">{skill}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSkill(skill)}
                                                                    className="text-purple-300 hover:text-red-400 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Resume Upload */}
                                {currentStep === 4 && (
                                    <div>
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gradient">Resume/CV</h2>
                                                <p className="text-purple-300">Upload your resume or CV document</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label htmlFor="resumeFile" className="cursor-pointer block">
                                                <div className="glass-effect border border-purple-400/30 rounded-xl p-8 hover:border-purple-400/50 transition-colors text-center">
                                                    <div className="flex flex-col items-center space-y-4">
                                                        <Upload className="w-12 h-12 text-purple-400" />
                                                        <div>
                                                            <p className="text-white font-medium text-lg">
                                                                {formData.resumeFile ? formData.resumeFile.name : "Click to upload your resume"}
                                                            </p>
                                                            <p className="text-purple-300 text-sm mt-2">
                                                                PDF or DOCX files only (max. 10MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    id="resumeFile"
                                                    type="file"
                                                    accept=".pdf,.docx"
                                                    className="hidden"
                                                    onChange={handleResumeUpload}
                                                />
                                            </label>

                                            {formData.resumeFile && (
                                                <div className="glass-effect border border-green-400/30 rounded-lg p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                        <span className="text-white font-medium">File uploaded successfully</span>
                                                    </div>
                                                    <p className="text-green-300 text-sm mt-1">
                                                        {formData.resumeFile.name} ({(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center space-x-2 px-6 py-3 glass-effect border border-purple-400/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400/50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex items-center space-x-2 glow-button px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!canProceed() || isSubmitting}
                                    className="glow-button px-8 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            )}
                        </div>

                        {submitError && (
                            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-300 text-sm text-center">{submitError}</p>
                            </div>
                        )}

                        <p className="text-purple-300 text-sm text-center mt-4">
                            By submitting this form, you agree to our terms of service and privacy policy.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default InterviewerVerification;