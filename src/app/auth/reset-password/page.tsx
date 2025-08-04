"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useAuth } from '../../../hooks/useAuth'
import { toast } from 'sonner'

// Particle component for background animation
const Particle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
      opacity: [0, 0.6, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  const email = searchParams.get('email') || localStorage.getItem("resetEmail") || ''
  const otp = searchParams.get('otp') || localStorage.getItem("resetOTP") || ''

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => <Particle key={i} delay={i * 0.1} />)

  // Password validation
  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter")
    if (!/\d/.test(password)) errors.push("One number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("One special character")
    return errors
  }

  const passwordErrors = validatePassword(formData.password)
  const isPasswordValid = passwordErrors.length === 0 && formData.password.length > 0
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleResetPassword = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!email || !otp) {
      toast.error("Missing email or OTP. Please try again.")
      router.push("/auth/forgot-password")
      return
    }


    if (!isPasswordValid) {
      newErrors.password = "Password doesn't meet requirements"
    }

    if (!doPasswordsMatch) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    // Simulate API call

    try {
      await resetPassword(email, otp, formData.password)

      // Clear stored data
      localStorage.removeItem("resetEmail")
      localStorage.removeItem("resetOTP")

      toast.success("Password reset successfully!")
      router.push("/auth?reset=success")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
      {particles}

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Panel */}
        <motion.div
          className="text-center lg:text-left relative"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#BC8CFF]/20 to-[#3B0A58]/20 rounded-3xl blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="relative z-10">
            <motion.h1
              className="text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-[#E6EDF3] via-[#BC8CFF] to-[#58A6FF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              IntervueX
            </motion.h1>
            <motion.p
              className="text-3xl text-[#BC8CFF] mb-6 font-semibold"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Create New Password
            </motion.p>
            <motion.p
              className="text-[#7D8590] text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              Your identity has been verified. Please create a strong new password for your account.
            </motion.p>

            {/* Floating elements */}
            <motion.div
              className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-br from-[#BC8CFF]/30 to-[#3B0A58]/30 rounded-full blur-xl"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-[#58A6FF]/30 to-[#BC8CFF]/30 rounded-full blur-xl"
              animate={{
                y: [0, 15, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#BC8CFF]/10 to-[#3B0A58]/10 rounded-2xl blur-2xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <Card className="bg-[#161B22]/90 backdrop-blur-xl border-[#30363D]/50 shadow-2xl relative z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BC8CFF]/5 to-[#3B0A58]/5" />

            <CardHeader className="relative z-10">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth")}
                className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 mb-4 w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#BC8CFF]/20 to-[#3B0A58]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#BC8CFF]" />
                </div>
                <CardTitle className="text-3xl text-[#E6EDF3] mb-2">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-[#7D8590] text-lg">
                  Create a strong password for {email}
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E6EDF3]">New Password</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 pl-12 pr-12 ${errors.password ? 'border-[#FF7B72]' : ''
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] hover:text-[#E6EDF3] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.password && (
                    <p className="text-[#FF7B72] text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#0D1117]/50 rounded-lg p-4 space-y-2"
                  >
                    <p className="text-[#E6EDF3] text-sm font-medium">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { check: formData.password.length >= 8, text: "At least 8 characters" },
                        { check: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
                        { check: /[a-z]/.test(formData.password), text: "One lowercase letter" },
                        { check: /\d/.test(formData.password), text: "One number" },
                        { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: "One special character" },
                      ].map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle
                            className={`w-4 h-4 ${req.check ? 'text-[#3FB950]' : 'text-[#7D8590]'}`}
                          />
                          <span className={`text-sm ${req.check ? 'text-[#3FB950]' : 'text-[#7D8590]'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E6EDF3]">Confirm Password</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-5 h-5" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 pl-12 pr-12 ${errors.confirmPassword ? 'border-[#FF7B72]' : doPasswordsMatch ? 'border-[#3FB950]' : ''
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] hover:text-[#E6EDF3] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {errors.confirmPassword && (
                    <p className="text-[#FF7B72] text-sm">{errors.confirmPassword}</p>
                  )}
                  {doPasswordsMatch && (
                    <p className="text-[#3FB950] text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Passwords match
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  onClick={handleResetPassword}
                  disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
                  className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Lock className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <p className="text-[#7D8590] text-sm">
                  Remember your password?{" "}
                  <button
                    onClick={() => router.push("/auth")}
                    className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 transition-colors font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}