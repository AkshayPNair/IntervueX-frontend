export interface SignupUserData {
    name: string;
    email: string;
    password: string;
    role: "user" | "interviewer" | "admin";
}

export interface SignupResponse {
    message: string;
    user?: User;
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

export interface GoogleLoginDTO {
    email: string;
    name: string;
    profilePicture?: string;
    googleId: string;
}

export interface RoleSelectionDTO {
    role: "user" | "interviewer";
    tempToken?: string; // Temporary authentication token
    sessionId?: string; 
}

export interface GoogleAuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: "user" | "interviewer";
        isVerified: boolean;
        profilePicture?: string;
        isNewUser: boolean;
    };
    needsRoleSelection: boolean;
    tempToken?: string; // Temporary authentication token
    sessionId?: string;
    message?: string;
}

export interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
}

export interface GoogleUserInfo {
    sub: string; // Google ID
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}