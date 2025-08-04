export interface SignupUserData {
    name: string;
    email: string;
    password: string;
    role: "user" | "interviewer" | "admin";
}

export interface SignupInterviewerData {
     profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved?: boolean;
    hasSubmittedVerification?:boolean
}

export interface AdminUserList {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    totalSessions: number;
    createdAt?: string;
    updatedAt?: string;
}


export interface AuthResponse {
    user: User;
    message?: string;
}
