"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import {
  Settings,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  Shield,
  Key,
} from "lucide-react"
import { useChangeUserPassword } from "@/hooks/useChangeUserPassword"
import { useDeleteUserAccount } from "@/hooks/useDeleteUserAccount"
import { useAuth } from "@/hooks/useAuth"
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteAccount: deleteUser, loading: isDeletingUser, error: deleteUserError } = useDeleteUserAccount()
  const { changePassword, loading: isChangingPassword, error: changePasswordError } = useChangeUserPassword()
  const { logout } = useAuth()

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const confirmationText = "DELETE MY ACCOUNT"
  const isDeleteConfirmed = deleteConfirmText === confirmationText

  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter")
    if (!/\d/.test(password)) errors.push("One number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("One special character")
    return errors
  }

  const passwordErrors = validatePassword(passwordData.newPassword)
  const isPasswordValid = passwordErrors.length === 0 && passwordData.newPassword.length > 0

  const handlePasswordChange = async () => {
    if (!isPasswordValid) {
      toast.error("New password doesn't meet requirements!")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!")
      return
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password changed successfully!")
    } catch (e: any) {
      const message = e?.response?.data?.error || e?.message || changePasswordError || 'Failed to change password'
      toast.error(message)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteUser()
      setShowDeleteModal(false)
      toast.success("Account deleted successfully!")
      await logout()
      router.replace("/auth")
    } catch (e: any) {
      const message = e?.response?.data?.error || deleteUserError || 'Failed to delete account'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#BC8CFF]/20 to-[#3B0A58]/20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#BC8CFF]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Account Settings</h1>
                <p className="text-[#7D8590] text-lg">Manage your account preferences and security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Change Password Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
                <CardHeader>
                  <CardTitle className="text-[#E6EDF3] flex items-center text-2xl">
                    <Lock className="w-6 h-6 mr-3 text-[#58A6FF]" />
                    Change Password
                  </CardTitle>
                  <p className="text-[#7D8590]">Update your password to keep your account secure</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E6EDF3]">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#7D8590] hover:text-[#E6EDF3]"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E6EDF3]">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#7D8590] hover:text-[#E6EDF3]"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    {passwordData.newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-[#161B22] rounded-lg border border-[#30363D]"
                      >
                        <h4 className="text-[#E6EDF3] text-sm font-medium mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-[#58A6FF]" />
                          Password Requirements
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <div className={`flex items-center text-sm ${passwordData.newPassword.length >= 8 ? 'text-green-400' : 'text-[#7D8590]'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${passwordData.newPassword.length >= 8 ? 'bg-green-400' : 'bg-[#7D8590]'}`}></div>
                            At least 8 characters
                          </div>
                          <div className={`flex items-center text-sm ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-[#7D8590]'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-[#7D8590]'}`}></div>
                            One uppercase letter
                          </div>
                          <div className={`flex items-center text-sm ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-[#7D8590]'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-[#7D8590]'}`}></div>
                            One lowercase letter
                          </div>
                          <div className={`flex items-center text-sm ${/\d/.test(passwordData.newPassword) ? 'text-green-400' : 'text-[#7D8590]'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-[#7D8590]'}`}></div>
                            One number
                          </div>
                          <div className={`flex items-center text-sm ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-400' : 'text-[#7D8590]'}`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-[#7D8590]'}`}></div>
                            One special character
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E6EDF3]">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#7D8590] hover:text-[#E6EDF3]"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || !isPasswordValid || isChangingPassword}
                      className="bg-gradient-to-r from-[#58A6FF] to-[#0969DA] hover:from-[#58A6FF]/80 hover:to-[#0969DA]/80 text-white shadow-lg hover:shadow-[0_0_20px_rgba(88,166,255,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Changing Password...</span>
                        </div>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-[#FF7B72]/10 to-[#DA3633]/10 backdrop-blur-md border-[#FF7B72]/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center text-2xl">
                    <AlertTriangle className="w-6 h-6 mr-3 text-[#FF7B72]" />
                    Danger Zone
                  </CardTitle>
                  <p className="text-[#7D8590]">Irreversible and destructive actions</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#FF7B72]/5 border border-[#FF7B72]/20 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-red-400 font-semibold text-lg mb-2">Delete Account</h3>
                        <p className="text-[#7D8590] mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <ul className="text-[#7D8590] text-sm space-y-1 mb-4">
                          <li>• All your interview sessions will be cancelled</li>
                          <li>• Your profile and data will be permanently deleted</li>
                          <li>• You will lose access to all feedback and analytics</li>
                          <li>• This action cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setShowDeleteModal(true)}
                        variant="outline"
                        className="border-[#FF7B72] text-[#FF7B72] hover:bg-[#FF7B72]/10 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#161B22] border border-[#FF7B72]/30 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#FF7B72]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-[#FF7B72]" />
                </div>
                <h3 className="text-[#E6EDF3] text-2xl font-bold mb-2">Delete Account</h3>
                <p className="text-[#7D8590]">This action cannot be undone. This will permanently delete your account.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-[#FF7B72]/5 border border-[#FF7B72]/20 rounded-lg p-4">
                  <h4 className="text-[#E6EDF3] font-semibold mb-2">What will be deleted:</h4>
                  <ul className="text-[#7D8590] text-sm space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All interview sessions and history</li>
                    <li>• Feedback and performance analytics</li>
                    <li>• Chat conversations and messages</li>
                    <li>• Wallet balance and transaction history</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E6EDF3]">
                    Type <span className="font-mono bg-[#30363D] px-2 py-1 rounded text-[#FF7B72]">{confirmationText}</span> to confirm:
                  </label>
                  <Input
                    placeholder="Type the confirmation text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#FF7B72] focus:ring-[#FF7B72]/20"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                  className="flex-1 border-[#30363D] text-[#7D8590] hover:bg-[#30363D]/50 bg-transparent"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={!isDeleteConfirmed || isDeleting}
                  className="flex-1 bg-[#FF7B72] hover:bg-[#FF7B72]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <FloatingMascot />
    </div>
  )
}