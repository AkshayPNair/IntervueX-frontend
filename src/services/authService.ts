import api from './api'
import { SignupUserData, SignupInterviewerData, GoogleLoginDTO, RoleSelectionDTO, GoogleAuthResponse} from '../types/auth.types';

export const login= async(email: string, password: string)=>{
    const response=await api.post('/auth/login', {email,password})
    return response.data
}

export const signup= async(userData:SignupUserData, interviewerData?:SignupInterviewerData)=>{
    const response=await api.post('/auth/signup',{userDto:userData,interviewerDto:interviewerData})
    return response.data
}

export const refreshToken = async () => {
    const response = await api.post('/auth/refresh')
     return response.data
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        return payload.exp < currentTime
    } catch (error) {
        return true // If we can't decode, consider it expired
    }
}

export const decodeToken = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
            id: payload.id || payload.userId,
            email: payload.email,
            role: payload.role,
            isBlocked: payload.isBlocked
        }
    } catch (error) {
        throw new Error('Invalid token')
    }
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

export const googleLogin = async(googleData: GoogleLoginDTO): Promise<GoogleAuthResponse> => {
    const response = await api.post('/auth/google', googleData)
    return response.data
}

export const selectRole = async(roleData: RoleSelectionDTO): Promise<GoogleAuthResponse> => {
    try {
        const response = await api.post('/auth/google/select-role', roleData)       
        return response.data
    } catch (error) {  
        throw new Error
    }
}

export const logout=async()=>{
    const response=await api.post('/auth/logout')
    return response.data
}