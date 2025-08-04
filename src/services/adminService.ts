import api from "./api"

export const fetchAllUsers=async()=>{
    const response=await api.get('/admin/users')
    return response.data.users;
}

export const blockUser = async (userId: string) => {
    await api.patch(`/admin/block/${userId}`);
}

export const unblockUser = async (userId: string) => {
    await api.patch(`/admin/unblock/${userId}`);
}

export const fetchPendingInterviewers = async () => {
    const response = await api.get('/admin/interviewer/pending');
    return response.data.interviewers;
}

export const approveInterviewer = async (interviewerId: string) => {
    const response = await api.patch(`/admin/interviewer/approve/${interviewerId}`);
    return response.data;
}

export const rejectInterviewer = async (interviewerId: string, rejectedReason?:string) => {
    const response = await api.patch(`/admin/interviewer/reject/${interviewerId}`,{
        rejectedReason
    });
  return response.data;
}

