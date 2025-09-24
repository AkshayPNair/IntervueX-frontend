"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Particle } from "@/components/ui/particle"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ArrowLeft, Mail, Clock } from "lucide-react"
import api from '../../../services/api'
import { toast } from 'sonner'

 function OTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const isResetPassword = searchParams.get('type') === 'reset'
  const resetEmail = searchParams.get('email') || ''

  useEffect(() => {
    if (isResetPassword && resetEmail) {
      localStorage.setItem('resetEmail', resetEmail)
    }
  }, [isResetPassword, resetEmail])

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => <Particle key={i} delay={i * 0.1} />)

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])



  const handleVerifyOTP = async () => {
    if (otp.length !== 6){
      toast.error("Please enter a complete 6-digit OTP")
      return 
    }

    // const email = localStorage.getItem("otpEmail")
    // const name = localStorage.getItem("otpName")
    // const password = localStorage.getItem("otpPassword")

    // if (!email || !name || !password) {
    //     alert("Some signup details are missing. Please try signing up again.")
    //     router.push("/auth")
    //     return
    // }

    setIsVerifying(true)

    try {
      if (isResetPassword) {
        // For password reset flow
        const email = resetEmail || localStorage.getItem("resetEmail")
        if (!email) {
          toast.error("Email not found. Please try again.")
          router.push("/auth/forgot-password")
          return
        }

        if (!/^\d{6}$/.test(otp)) {
          toast.error("Please enter a valid 6-digit OTP")
          return
        }

        await api.post('/auth/verify-otp', {
          email, 
          otp, 
          type: 'reset-password'
        });

        // Store email and OTP for reset password page
        localStorage.setItem("resetEmail", email)
        localStorage.setItem("resetOTP", otp)

        toast.success("OTP verified! Please set your new password.")
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`)
      } else {
        // For signup flow
        const email = localStorage.getItem("otpEmail")
        const name = localStorage.getItem("otpName")
        const password = localStorage.getItem("otpPassword")

        if (!email || !name || !password) {
          toast.error("Some signup details are missing. Please try signing up again.")
          router.push("/auth")
          return
        }

        await api.post('/auth/verify-otp', {
          email, 
          otp, 
          name, 
          password,
          type:'signup'
        });

        toast.success("OTP verified. Please login.");
        localStorage.removeItem("otpEmail")
        localStorage.removeItem("otpName")
        localStorage.removeItem("otpPassword")
        router.push("/auth?mode=login&verified=true")
      }

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Verification failed")
      console.error("OTP verification error:", err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    let email = ""

    if (isResetPassword) {
      email = resetEmail || localStorage.getItem("resetEmail") || ""
      console.log("Reset password flow - resetEmail:", resetEmail, "localStorage:", localStorage.getItem("resetEmail"))
      if (!email) {
        toast.error("Email not found. Please try again.")
        router.push("/auth/forgot-password")
        return
      }
    } else {
      email = localStorage.getItem("otpEmail") || ""
      console.log("Signup flow - email from localStorage:", email)
      if (!email) {
        toast.error("Email not found. Please try signing up again.")
        router.push("/auth")
        return
      }
    }

    setTimer(120)
    setCanResend(false)
    setOtp("")
    console.log("Resending OTP...", email)

    try {
      // await api.post('/auth/resend-otp',{email})
      if (isResetPassword) {
        await api.post('/auth/forgot-password', { email })
      } else {
        await api.post('/auth/resend-otp', { email })
      }
      toast.success('OTP resent successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Resend failed");
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      <Navigation />
      {particles}

      <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
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
                Verify Your Account
              </motion.p>
              <motion.p
                className="text-[#7D8590] text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                We've sent a 6-digit verification code to your email address.
                Enter the code below to complete your registration.
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

          {/* Right Panel - OTP Form */}
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-6 left-6"
                >
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/auth")}
                    className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 p-2 h-auto font-normal hover:bg-[#BC8CFF]/10 rounded-lg transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign Up
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#BC8CFF]/20 to-[#3B0A58]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-[#BC8CFF]" />
                  </div>
                  <CardTitle className="text-3xl text-center text-[#E6EDF3] mb-2">
                    Enter Verification Code
                  </CardTitle>
                  <CardDescription className="text-center text-[#7D8590] text-lg ">
                    We've sent a 6-digit code to your email
                  </CardDescription>

                </motion.div>
              </CardHeader>

              <CardContent className="space-y-8 relative z-10">



                {/* OTP Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex justify-center"
                >
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    className="gap-3"
                  >
                    <InputOTPGroup className="gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-14 h-14 text-2xl font-bold bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 rounded-lg transition-all duration-300"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </motion.div>

                {/* Timer and Resend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center space-y-4"
                >
                  {!canResend ? (
                    <div className="flex items-center justify-center space-x-2 text-[#7D8590]">
                      <Clock className="w-4 h-4" />
                      <span>Resend code in {formatTime(timer)}</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResendOTP}
                      className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 font-medium"
                    >
                      Resend Code
                    </Button>
                  )}
                </motion.div>

                {/* Verify Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || isVerifying}
                    className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </motion.div>

                {/* Help Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-sm text-[#7D8590]"
                >
                  <p>Didn't receive the code? Check your spam folder or</p>
                  <button
                    onClick={() => router.push("/auth")}
                    className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 transition-colors underline"
                  >
                    try a different email address
                  </button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <FloatingMascot />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPPage />
    </Suspense>
  )
}