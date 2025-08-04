"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Send } from "lucide-react"
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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => <Particle key={i} delay={i * 0.1} />)

  const handleSendOTP = async () => {
    if (!email.trim()) return

    setIsLoading(true)
    // Simulate API call

    try {
      await forgetPassword(email)
      toast.success("OTP sent to your email successfully!")
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=reset`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send OTP")
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
              Forgot Your Password?
            </motion.p>
            <motion.p
              className="text-[#7D8590] text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              No worries! Enter your email address and we'll send you a verification code to reset your password.
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
              >
                <CardTitle className="text-3xl text-center text-[#E6EDF3] mb-2">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-center text-[#7D8590] text-lg">
                  Enter your email to receive a verification code
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#E6EDF3]">Email Address</label>
                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 pl-12"
                    />
                  </motion.div>
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
                  onClick={handleSendOTP}
                  disabled={!email.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? "Sending OTP..." : "Send Verification Code"}
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