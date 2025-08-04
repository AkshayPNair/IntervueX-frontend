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