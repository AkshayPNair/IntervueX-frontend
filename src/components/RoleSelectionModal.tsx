import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { UserCheck, BrainCog, CheckCircle2, X } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

interface RoleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    isLoading?: boolean;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
    isOpen,
    onClose,
    userName,
    isLoading = false,
}) => {
    const [selectedRole, setSelectedRole] = useState<'user' | 'interviewer' | null>(null);
    const { selectRole } = useAuth();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const roles = [
        {
            id: 'user' as const,
            title: 'Candidate',
            description: 'Looking to practice and improve your technical interview skills',
            icon: UserCheck,
            features: [
                'Practice coding interviews',
                'Get feedback from experts',
                'Access to interview resources',
                'Track your progress'
            ],
            color: 'from-blue-500 to-purple-600',
            borderColor: 'border-blue-500/50',
            bgColor: 'bg-blue-500/10',
            hoverColor: 'hover:border-blue-400'
        },
        {
            id: 'interviewer' as const,
            title: 'Interviewer',
            description: 'Share your expertise by conducting mock interviews',
            icon: BrainCog,
            features: [
                'Conduct mock interviews',
                'Help candidates improve',
                'Earn from your expertise',
                'Flexible scheduling'
            ],
            color: 'from-purple-500 to-pink-600',
            borderColor: 'border-purple-500/50',
            bgColor: 'bg-purple-500/10',
            hoverColor: 'hover:border-purple-400'
        }
    ];

    const handleRoleSelect = async () => {
        if (selectedRole && !isLoading && !isProcessing) {
            setIsProcessing(true);
            try {
                console.log('RoleModal: Selecting role:', selectedRole);
               const response = await selectRole({ role: selectedRole });
                console.log('RoleModal: Role selection successful:', response);
                if (response.user) {
                    // Redirect based on role
                    if (selectedRole === 'user') {
                        window.location.href = '/user/dashboard';
                    } else if (selectedRole === 'interviewer') {
                        window.location.href = '/interviewer/dashboard';
                    }
                }
                onClose();
            } catch (error:any) {
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message
                });
                // Show error to user
                alert(`Role selection failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleClose = () => {
        if (!isLoading && !isProcessing) {
            setSelectedRole(null);
            onClose();
        }
    };

    const isDisabled = isLoading || isProcessing;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-[#0D1117] rounded-2xl border border-[#30363D] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative p-8 pb-4 border-b border-[#30363D]/50">
                            <button
                                onClick={handleClose}
                                disabled={isDisabled}
                                className="absolute top-6 right-6 text-[#7D8590] hover:text-[#E6EDF3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-center"
                            >
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#E6EDF3] via-[#BC8CFF] to-[#58A6FF] bg-clip-text text-transparent mb-2">
                                    Welcome to IntervueX, {userName}!
                                </h2>
                                <p className="text-[#7D8590] text-lg">
                                    Choose your role to get started on your journey with us
                                </p>
                            </motion.div>
                        </div>

                        {/* Role Cards */}
                        <div className="p-8">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {roles.map((role, index) => (
                                    <motion.div
                                        key={role.id}
                                        initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                    >
                                        <Card
                                            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 bg-[#161B22]/90 backdrop-blur-xl border-2 ${
                                                selectedRole === role.id
                                                    ? role.borderColor + ' shadow-lg shadow-purple-500/20'
                                                    : 'border-[#30363D] ' + role.hoverColor
                                            }`}
                                            onClick={() => !isDisabled && setSelectedRole(role.id)}
                                        >
                                            {selectedRole === role.id && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", duration: 0.5 }}
                                                    className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 z-10"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </motion.div>
                                            )}
                                            <CardHeader className="text-center pb-4">
                                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${role.bgColor} mb-4 mx-auto`}>
                                                    <role.icon className="w-7 h-7 text-white" />
                                                </div>
                                                <CardTitle className={`text-xl font-bold bg-gradient-to-r ${role.color} bg-clip-text text-transparent`}>
                                                    {role.title}
                                                </CardTitle>
                                                <CardDescription className="text-[#7D8590] text-sm">
                                                    {role.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2.5">
                                                    {role.features.map((feature, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -15 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.4, delay: 0.4 + idx * 0.05 }}
                                                            className="flex items-center space-x-2.5"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
                                                            <span className="text-[#E6EDF3] text-sm">{feature}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <Button
                                    onClick={handleRoleSelect}
                                    disabled={!selectedRole || isDisabled}
                                    className={`px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                                        selectedRole
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105'
                                            : 'bg-[#30363D] text-[#7D8590] cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Setting up your account...</span>
                                        </div>
                                    ) : (
                                        `Continue as ${selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Selected Role'}`
                                    )}
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    disabled={isDisabled}
                                    variant="outline"
                                    className="px-8 py-3 text-base font-medium rounded-xl border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </Button>
                            </motion.div>

                            {selectedRole === 'interviewer' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.4 }}
                                    className="mt-6 p-4 bg-[#161B22] rounded-lg border border-[#30363D]/50"
                                >
                                    <p className="text-sm text-[#7D8590] text-center">
                                        <span className="text-yellow-400"> Note:</span> As an interviewer, your profile will need to be reviewed and approved by our admin team before you can start conducting interviews.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RoleSelectionModal;