import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';
import { FeedbackResponseData, SubmitFeedbackData} from '@/types/feedback.types';
import { InterviewerDashboardResponse } from '@/types/dashboard.types';
import { ChangePasswordData } from '@/types/auth.types';

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
    
    const response = await api.post(API_ROUTES.INTERVIEWER.SUBMIT_VERIFICATION, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};

export const getVerificationStatus=async()=>{
    const response=await api.get(API_ROUTES.INTERVIEWER.VERIFICATION_STATUS)
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
        hourlyRate?: number;
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
    hourlyRate?: number;
}

export const getInterviewerProfile=async():Promise<InterviewerProfile>=>{
    const response=await api.get(API_ROUTES.INTERVIEWER.PROFILE)
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
            } else if (key === 'yearsOfExperience' || key==='hourlyRate') {
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

    const response = await api.put(API_ROUTES.INTERVIEWER.UPDATE_PROFILE, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const submitFeedback=async(data:SubmitFeedbackData):Promise<SubmitFeedbackData>=>{
    const response = await api.post(API_ROUTES.INTERVIEWER.SUBMIT_FEEDBACK, data);
    return response.data;
}

export const listInterviewerFeedbacks = async():Promise<FeedbackResponseData[]>=>{
    const response=await api.get(API_ROUTES.INTERVIEWER.FEEDBACK)
    return response.data
}

export const getFeedbackById=async(id:string):Promise<FeedbackResponseData>=>{
    const response = await api.get(API_ROUTES.INTERVIEWER.FEEDBACK_BY_ID(id));
    return response.data;

}

export const getUserRatingByBooking=async(bookingId:string)=>{
    const response = await api.get(API_ROUTES.INTERVIEWER.RATING_BY_BOOKING(bookingId))
    return response.data
}

export const getInterviewerDashboard=async():Promise<InterviewerDashboardResponse>=>{
    const response = await api.get(API_ROUTES.INTERVIEWER.DASHBOARD)
    return response.data
}

export const changeInterviewerPassword = async (data: ChangePasswordData) => {
    const response = await api.put(API_ROUTES.INTERVIEWER.CHANGE_PASSWORD, data)
    return response.data
}

export const deleteInterviewerAccount = async () => {
    const response = await api.delete(API_ROUTES.INTERVIEWER.DELETE_ACCOUNT)
    return response.data
}