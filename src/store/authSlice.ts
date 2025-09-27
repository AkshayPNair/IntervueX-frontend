import {createSlice} from '@reduxjs/toolkit';
import { use } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved?:boolean;
    profilePicture?: string;
    resume?: string;
    skills?: string[];
    googleId?:string;
}

const initialState={
    user:null as User|null,
}

const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        setUser(state,action){
            state.user=action.payload;
        },
        logout(state){
            state.user=null;
        }
    }
});

export const {setUser, logout}=authSlice.actions
export default authSlice.reducer;