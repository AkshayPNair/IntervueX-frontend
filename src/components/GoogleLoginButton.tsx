'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginDTO, GoogleUserInfo } from '@/types/auth.types';

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleLoginButtonProps {
    onSuccess?: (needsRoleSelection: boolean, userName: string,authData?: {tempToken?: string, sessionId?: string}) => void;
    onError?: (error: string) => void;
    className?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
    onSuccess,
    onError,
    className = ''
}) => {
    const { googleLogin } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState<boolean>(false);

    useEffect(() => {
        // Load Google Identity Services
        const loadGoogleScript = () => {
            if (window.google) {
                initializeGoogle();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogle;
            script.onerror = () => {
                console.error('Failed to load Google Identity Services');
                onError?.('Failed to load Google login');
            };
            document.head.appendChild(script);
        };

        const initializeGoogle = () => {
            if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
                console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
                console.log('Current origin:', window.location.origin);
                
                try {
                    window.google.accounts.id.initialize({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        use_fedcm_for_prompt: false, // Add this to avoid FedCM issues
                    });
                    setIsGoogleLoaded(true);
                } catch (error) {
                    console.error('Error initializing Google:', error);
                    onError?.('Failed to initialize Google login');
                }
            } else {
                console.error('Google Client ID not found or Google not loaded');
                onError?.('Google configuration error');
            }
        };

        loadGoogleScript();
    }, [onError]);

    const decodeGoogleToken = (token: string): GoogleUserInfo | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding Google token:', error);
            return null;
        }
    };

    const handleGoogleResponse = async (response: any) => {
        setIsLoading(true);
        try {
            const userInfo = decodeGoogleToken(response.credential);
            if (!userInfo) {
                throw new Error('Failed to decode Google token');
            }

            const googleData: GoogleLoginDTO = {
                email: userInfo.email,
                name: userInfo.name,
                profilePicture: userInfo.picture,
                googleId: userInfo.sub,
            };
            console.log('Sending Google data to backend:', googleData);
            const authResponse = await googleLogin(googleData);
            console.log('Google login response:', authResponse);
            if (authResponse) {
                if (authResponse.needsRoleSelection) {
                    console.log('User needs role selection, showing modal');
                    const authData = {
                        tempToken: authResponse.tempToken,
                        sessionId: authResponse.sessionId
                    };
                    console.log('Passing auth data to role selection:', authData);
                    onSuccess?.(true, authResponse.user.name, authData);
                } else {
                    console.log('User has existing role:', authResponse.user.role);
                    // Redirect based on existing role
                    if (authResponse.user.role === 'user') {
                        window.location.href = '/user/dashboard';
                    } else if (authResponse.user.role === 'interviewer') {
                        window.location.href = '/interviewer/dashboard';
                    }
                    onSuccess?.(false, authResponse.user.name);
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Google login failed';
            console.error('Google login error:', err);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Clicking google button');
        if (!isGoogleLoaded) {
            console.error('Google not loaded yet');
            onError?.('Google login not ready. Please try again.');
            return;
        }

        if (window.google) {
            try {
                // Use renderButton method instead of prompt for better reliability
                const buttonDiv = document.createElement('div');
                buttonDiv.style.position = 'absolute';
                buttonDiv.style.top = '-9999px';
                buttonDiv.style.left = '-9999px';
                document.body.appendChild(buttonDiv);
                
                window.google.accounts.id.renderButton(buttonDiv, {
                    theme: 'filled_blue',
                    size: 'large',
                    width: 250,
                    click_listener: () => {
                        // This will trigger the login flow
                    }
                });

                // Simulate click on the hidden button
                const googleButton = buttonDiv.querySelector('div[role="button"]');
                if (googleButton) {
                    (googleButton as HTMLElement).click();
                }

                // Clean up
                setTimeout(() => {
                    if (document.body.contains(buttonDiv)) {
                        document.body.removeChild(buttonDiv);
                    }
                }, 1000);

            } catch (error) {
                console.error('Google login error:', error);
                onError?.('Failed to initiate Google login');
            }
        } else {
            console.error('Google object not available');
            onError?.('Google login not available');
        }
    };

    

    return (
        <>
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading || !isGoogleLoaded}
                className={`
                    flex items-center justify-center gap-3 w-full px-6 py-3 
                    bg-white border border-gray-300 rounded-lg shadow-sm
                    hover:bg-gray-50 hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 font-medium text-gray-700
                    ${className}
                `}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            
        </>
    );
};

export default GoogleLoginButton;