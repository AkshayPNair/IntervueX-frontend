import api from './api';

export interface VerificationData {
    profilePicture: File | null;
    jobTitle: string;
    yearsExperience: string;
    professionalBio: string;
    technicalSkills: string[];
    resumeFile: File | null;
}

export interface VerificationStatusData {
    hasSubmittedVerification: boolean;
    isApproved: boolean;
    isRejected?:boolean;
    rejectedReason?:string;
    profileExists: boolean;
    verificationData?: {
        jobTitle?: string;
        yearsOfExperience?: number;
        professionalBio?: string;
        technicalSkills?: string[];
        profilePic?: string;
        resume?: string;
    } | null;
}

export const submitVerification = async (data: VerificationData) => {
    const formData = new FormData();
    
    if (data.profilePicture) {
        formData.append('profilePic', data.profilePicture);
    }
    
    if (data.resumeFile) {
        formData.append('resume', data.resumeFile);
    }
    
    formData.append('jobTitle', data.jobTitle);
    formData.append('yearsOfExperience', data.yearsExperience);
    formData.append('professionalBio', data.professionalBio);
    formData.append('technicalSkills', JSON.stringify(data.technicalSkills));
    
    const response = await api.post('/interviewer/submit-verification', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

export const getVerificationStatus=async()=>{
    const response=await api.get('/interviewer/verification-status')
    return response.data
}

export interface InterviewerProfile{
    user:{
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        isApproved: boolean;
        totalSessions: number;
    }
    profile:{
        profilePic?: string;
        jobTitle?: string;
        yearsOfExperience?: number;
        professionalBio?: string;
        technicalSkills: string[];
        resume?: string;
    }
}

export interface UpdateProfileData {
    name?: string;
    profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
}

export const getInterviewerProfile=async():Promise<InterviewerProfile>=>{
    const response=await api.get('/interviewer/profile')
    return response.data
}

export const UpdateInterviewerProfile=async(
    data:UpdateProfileData,
    files?:{
        profilePic?:File;
        resume?:File,
    }
):Promise<InterviewerProfile>=>{
    const formData=new FormData()

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === 'technicalSkills' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (key === 'yearsOfExperience') {
                formData.append(key, value.toString());
            } else if (typeof value === 'string') {
                formData.append(key, value);
            }
        }
    });

    // Add files
    if (files?.profilePic) {
        formData.append('profilePic', files.profilePic);
    }
    if (files?.resume) {
        formData.append('resume', files.resume);
    }

    const response = await api.put('/interviewer/profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}