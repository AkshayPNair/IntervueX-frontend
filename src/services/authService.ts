import api from './api'
import { SignupUserData, SignupInterviewerData } from '../types/auth.types';

export const login= async(email: string, password: string)=>{
    const response=await api.post('/auth/login', {email,password})
    return response.data
}

export const signup= async(userData:SignupUserData, interviewerData?:SignupInterviewerData)=>{
    const response=await api.post('/auth/signup',{userDto:userData,interviewerDto:interviewerData})
    return response.data
}

export const fetchMe=async()=>{
    const response=await api.get('/auth/me')
    return response.data
}

export const forgetPassword=async(email:string)=>{
    const response=await api.post('/auth/forgot-password',{email})
    return response.data
}

export const resetPassword=async(otp:string,email:string,newPassword:string)=>{
    console.log("authService resetPassword called with:", {otp, email, newPassword});
    const response=await api.post('/auth/reset-password',{otp,email,newPassword})
    return response.data
}

export const logout=async()=>{
    const response=await api.post('/auth/logout')
    return response.data
}