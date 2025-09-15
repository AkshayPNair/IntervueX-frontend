import api from './api'
import { FeedbackResponseData, SubmitInterviewerRatingData } from '@/types/feedback.types';

export interface UserProfile{
    id:string,
    name: string;
  email: string;
  profilePicture?: string;
  resume?: string;
  skills: string[];
}

export interface UpdateProfileData {
  name?: string;
  skills?: string[];
  profilePicture?: File;
  resume?: File;
}

export const getUserProfile=async():Promise<UserProfile>=>{
    const response=await api.get('/user/profile')
    return response.data
}

export const updateUserProfile=async(profileData:UpdateProfileData):Promise<UserProfile>=>{
    const formData=new FormData()

    if (profileData.name) {
    formData.append('name', profileData.name);
  }
  
  if (profileData.skills) {
    formData.append('skills', JSON.stringify(profileData.skills));
  }
  
  if (profileData.profilePicture) {
    formData.append('profilePic', profileData.profilePicture);
  }
  
  if (profileData.resume) {
    formData.append('resume', profileData.resume);
  }

  const response = await api.put('/user/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export interface InterviewerProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  jobTitle?: string;
  professionalBio?: string;
  yearsOfExperience?: number;
  technicalSkills?: string[];
  rating?: number; 
  hourlyRate?: number; 
}

export const getAllInterviewers = async (): Promise<InterviewerProfile[]> => {
  const response = await api.get('/user/interviewers');
  return response.data;
};

export const getInterviewerById = async (id: string): Promise<InterviewerProfile> => {
  const response = await api.get(`/user/interviewers/${id}`);
  return response.data;
};

export const listUserFeedbacks = async (): Promise<FeedbackResponseData[]> => {
  const response = await api.get('/user/feedback');
  return response.data;
};

export const getUserFeedbackById = async (id: string): Promise<FeedbackResponseData> => {
  const response = await api.get(`/user/feedback/${id}`);
  return response.data;
};

export const submitInterviewerRating=async(data:SubmitInterviewerRatingData):Promise<SubmitInterviewerRatingData>=>{
  const response = await api.post('/user/rating', data);
  return response.data;
}

export const getInterviewerRatingByBooking = async (bookingId: string) => {
  const response = await api.get(`/user/rating/${bookingId}`)
  return response.data
}