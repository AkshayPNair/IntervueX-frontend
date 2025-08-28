import {useDispatch, useSelector} from 'react-redux';
import {login as loginService, signup as signupService, logout as logoutService,forgetPassword as forgetPasswordService, resetPassword as resetPasswordService,googleLogin as googleLoginService, selectRole as selectRoleService} from '../services/authService'
import { setUser } from '../store/authSlice';
import { RootState } from '../store/index';
import { SignupUserData, SignupInterviewerData,GoogleLoginDTO, RoleSelectionDTO,SignupResponse } from '../types/auth.types';


export const useAuth=()=>{
    const dispatch=useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const login=async (email: string,password:string)=>{
        const {user}=await loginService(email,password)
        dispatch(setUser(user))
        return user;
    }

    const signup=async(userData:SignupUserData,interviewerData?:SignupInterviewerData):Promise<SignupResponse>=>{
        const result=await signupService(userData,interviewerData);
        return result
    }

    const forgetPassword=async(email:string)=>{
        const result=await forgetPasswordService(email);
        return result;
    }

    const resetPassword=async(email:string,otp:string,newPassword:string)=>{
        console.log("useAuth resetPassword called with:", {email, otp, newPassword});
        const result=await resetPasswordService(otp,email,newPassword);
        return result;
    }

    const googleLogin = async(googleData: GoogleLoginDTO) => {
        const response = await googleLoginService(googleData);
        if (response.user && !response.needsRoleSelection) {
            dispatch(setUser(response.user));
        }
        return response;
    }

    const selectRole = async(roleData: RoleSelectionDTO) => {
        try {
            console.log('Attempting role selection with data:', roleData);
            const response = await selectRoleService(roleData);
            console.log('Role selection response:', response);
            if (response.user) {
                dispatch(setUser(response.user));
            }
            return response;
        } catch (error) {
            console.error('Role selection error in useAuth:', error);
            throw error;
         }
    }

    const logout=async()=>{
        await logoutService()
        dispatch(setUser(null))
    }

    return {login,signup,logout,forgetPassword,resetPassword,googleLogin,selectRole,isLoggedIn:!!user,user}
}