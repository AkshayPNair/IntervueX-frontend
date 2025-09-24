import api from './api'
import { FeedbackResponseData, SubmitInterviewerRatingData } from '@/types/feedback.types';
import { UserDashboardResponse } from '@/types/dashboard.types';
import { PaymentHistoryResponse } from '@/types/payment.types';
import { ChangePasswordData } from '@/types/auth.types';
import { API_ROUTES } from '../constants/apiRoutes';

export interface UserProfile {
  id: string,
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

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get(API_ROUTES.USER.PROFILE)
  return response.data
}

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  const formData = new FormData()

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

  const response = await api.put(API_ROUTES.USER.UPDATE_PROFILE, formData, {
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
  const response = await api.get(API_ROUTES.USER.INTERVIEWERS);
   return response.data;
};

export const getInterviewerById = async (id: string): Promise<InterviewerProfile> => {
  const response = await api.get(API_ROUTES.USER.INTERVIEWER_BY_ID(id));
  return response.data;
};

export const listUserFeedbacks = async (): Promise<FeedbackResponseData[]> => {
  const response = await api.get(API_ROUTES.USER.FEEDBACK);
  return response.data;
};

export const getUserFeedbackById = async (id: string): Promise<FeedbackResponseData> => {
  const response = await api.get(API_ROUTES.USER.FEEDBACK_BY_ID(id));
  return response.data;
};

export const submitInterviewerRating = async (data: SubmitInterviewerRatingData): Promise<SubmitInterviewerRatingData> => {
  const response = await api.post(API_ROUTES.USER.SUBMIT_RATING, data);
   return response.data;
}

export const getInterviewerRatingByBooking = async (bookingId: string) => {
  const response = await api.get(API_ROUTES.USER.RATING_BY_BOOKING(bookingId))
  return response.data
}

export const getUserPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  const response = await api.get(API_ROUTES.USER.PAYMENT_HISTORY)
  return response.data
}

export const getUserDashboard = async (): Promise<UserDashboardResponse> => {
  const response = await api.get(API_ROUTES.USER.DASHBOARD)
  return response.data
}

export const changeUserPassword = async (data:ChangePasswordData) => {
  const response = await api.put(API_ROUTES.USER.CHANGE_PASSWORD, data)
  return response.data
}

export const deleteUserAccount = async () => {
  const response = await api.delete(API_ROUTES.USER.DELETE_ACCOUNT)
  return response.data
}