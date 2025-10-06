import api from "./api"
import { API_ROUTES } from '../constants/apiRoutes';

export const fetchAllUsers=async(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number)=>{
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (role && role !== 'All') params.role = role;
    if (status && status !== 'All') {
        params.isBlocked = status === 'Blocked' ? true : false;
    }
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    const response=await api.get(API_ROUTES.ADMIN.USERS, { params })
    return response.data; // assuming backend returns { users: [], total: number, page: number, pageSize: number }
}

export const blockUser = async (userId: string) => {
    await api.patch(API_ROUTES.ADMIN.BLOCK_USER(userId));
}

export const unblockUser = async (userId: string) => {
    await api.patch(API_ROUTES.ADMIN.UNBLOCK_USER(userId));
}

export const fetchPendingInterviewers = async (searchQuery?: string) => {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await api.get(API_ROUTES.ADMIN.PENDING_INTERVIEWERS, { params });
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

export const getInterviewerResumeUrl = async (userId: string) => {
  const response = await api.get(API_ROUTES.ADMIN.INTERVIEWER_RESUME(userId));
  return response.data.url as string;
}

export const getAdminDashboard = async () => {
  const response = await api.get(API_ROUTES.ADMIN.DASHBOARD);
  return response.data;
}

export const getAdminSessions = async (searchQuery?: string, page?: number, pageSize?: number) => {
  const params: any = {};
  if (searchQuery) params.search = searchQuery;
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;
  const response = await api.get(API_ROUTES.ADMIN.SESSIONS, { params });
  return response.data; // backend returns { sessions: [], total: number }
}

