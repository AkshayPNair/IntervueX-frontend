import api from "./api"
import { API_ROUTES } from '../constants/apiRoutes';

export const fetchAllUsers=async()=>{
    const response=await api.get(API_ROUTES.ADMIN.USERS)
    return response.data.users;
}

export const blockUser = async (userId: string) => {
    await api.patch(API_ROUTES.ADMIN.BLOCK_USER(userId));
}

export const unblockUser = async (userId: string) => {
    await api.patch(API_ROUTES.ADMIN.UNBLOCK_USER(userId));
}

export const fetchPendingInterviewers = async () => {
    const response = await api.get(API_ROUTES.ADMIN.PENDING_INTERVIEWERS);
    return response.data.interviewers;
}

export const approveInterviewer = async (interviewerId: string) => {
    const response = await api.patch(API_ROUTES.ADMIN.APPROVE_INTERVIEWER(interviewerId));
    return response.data;
}

export const rejectInterviewer = async (interviewerId: string, rejectedReason?:string) => {
    const response = await api.patch(API_ROUTES.ADMIN.REJECT_INTERVIEWER(interviewerId),{
        rejectedReason
    });
  return response.data;
}

export const getAdminDashboard = async () => {
  const response = await api.get(API_ROUTES.ADMIN.DASHBOARD);
  return response.data;
}

export const getAdminSessions = async () => {
  const response = await api.get(API_ROUTES.ADMIN.SESSIONS);
  return response.data; // backend now returns an array directly
}

