"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Navigation } from "../../components/navigation"
import { Particle } from "../../components/ui/particle"
import { useAuth } from '../../hooks/useAuth'
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import GoogleLoginButton from "../../components/GoogleLoginButton"
import RoleSelectionModal from "../../components/RoleSelectionModal"
import { toast } from 'sonner'

export default function Auth() {
  const router = useRouter()
  const { login, signup } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "user" | "interviewer" | "admin",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [showRoleModal, setShowRoleModal] = useState<boolean>(false)
  const [googleUserName, setGoogleUserName] = useState<string>('')
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => <Particle key={i} delay={i * 0.1} />)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

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
  const isEmailValid = formData.email.length > 0 && validateEmail(formData.email)

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleGoogleSuccess = (needsRoleSelection: boolean, userName: string) => {
    if (needsRoleSelection) {
      setGoogleUserName(userName)
      setShowRoleModal(true)
    } else {
      toast.success('Successfully signed in with Google!')
    }
  }
  const handleGoogleError = (error: string) => {
    toast.error(error)
  }

  const handleRoleModalClose = () => {
    setShowRoleModal(false)
    setGoogleUserName('')
   }

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {}

    try {
      if (!isLogin) {

        if (!formData.name.trim()) {
          newErrors.name = "Name is required"
        }
        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
          newErrors.email = "Invalid email format"
        }
        if (!isPasswordValid) {
          newErrors.password = "Password doesn't meet requirements"
        }
        if (!doPasswordsMatch) {
          newErrors.confirmPassword = "Passwords don't match"
        }
        if (!formData.role) {
          newErrors.role = "Please select your role"
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }
        await signup(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role as "user" | "interviewer" | "admin"
          },
          formData.role === 'interviewer' ? {} : undefined
        )
        localStorage.setItem("otpEmail", formData.email)
        localStorage.setItem("otpName", formData.name)
        localStorage.setItem("otpPassword", formData.password)
        router.push('/auth/verify-otp')

      } else {
        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
          newErrors.email = "Invalid email format"
        }
        if (!formData.password.trim()) {
          newErrors.password = "Password is required"
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          return
        }
        const user = await login(formData.email, formData.password);
        if (user.role === 'interviewer') {
          router.push('/interviewer/dashboard')
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/dashboard')
        }

      }
      setErrors({})
    } catch (err: any) {
      toast.error(err.response?.data?.error || (isLogin ? "Login failed" : "Signup failed"));
      console.error("Signup error:", err);
    }
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} - IntervueX</title>
        <meta name="description" content="Join IntervueX to master your technical interviews" />
      </Head>

      <div className="min-h-screen pt-16 flex items-center justify-center px-4 relative overflow-hidden">
        <Navigation />
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
                Master Your Technical Interviews
              </motion.p>
              <motion.p
                className="text-[#7D8590] text-lg max-w-md mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Join thousands of developers who have successfully landed their dream jobs through our platform.
                Practice with industry experts and get personalized feedback.
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

          {/* Right Panel - Enhanced Form */}
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
                <div className="flex justify-center mb-6">
                  <div className="flex bg-[#0D1117]/80 rounded-xl p-1 backdrop-blur-sm">
                    <motion.button
                      onClick={() => setIsLogin(true)}
                      className={`px-8 py-3 rounded-lg transition-all duration-300 font-medium ${isLogin
                          ? "bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg"
                          : "text-[#7D8590] hover:text-[#E6EDF3]"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      onClick={() => setIsLogin(false)}
                      className={`px-8 py-3 rounded-lg transition-all duration-300 font-medium ${!isLogin
                          ? "bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] text-white shadow-lg"
                          : "text-[#7D8590] hover:text-[#E6EDF3]"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Register
                    </motion.button>
                  </div>
                </div>
                <motion.div
                  key={isLogin ? "login" : "register"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <CardTitle className="text-3xl text-center text-[#E6EDF3] mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription className="text-center text-[#7D8590] text-lg">
                    {isLogin ? "Sign in to continue your journey" : "Join the IntervueX community today"}
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <motion.div
                  key={isLogin ? "login-form" : "register-form"}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Name input only for Register */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#E6EDF3]">Name</label>
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value })
                            clearError('name')
                          }}
                          className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 ${errors.name ? 'border-[#FF7B72]' : ''
                            }`}
                        />
                      </motion.div>
                      {errors.name && (
                        <p className="text-[#FF7B72] text-sm">{errors.name}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E6EDF3]">Email Address</label>
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          clearError('email')
                        }}
                        className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 ${errors.email ? 'border-[#FF7B72]' : isEmailValid ? 'border-[#3FB950]' : ''
                          }`}
                      />
                    </motion.div>
                    {errors.email && (
                      <p className="text-[#FF7B72] text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#E6EDF3]">Password</label>
                    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value })
                          clearError('password')
                        }}
                        className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 pr-12 ${errors.password ? 'border-[#FF7B72]' : ''
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

                  {!isLogin && formData.password && (
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

                  {!isLogin && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-[#E6EDF3]">Confirm Password</label>
                        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => {
                              setFormData({ ...formData, confirmPassword: e.target.value })
                              clearError('confirmPassword')
                            }}
                            className={`bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 pr-12 ${errors.confirmPassword ? 'border-[#FF7B72]' : doPasswordsMatch ? 'border-[#3FB950]' : ''
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
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-[#E6EDF3]">I am a</label>
                        <select
                          value={formData.role}
                          onChange={(e) => {
                            const value=e.target.value
                            if (value === "user" || value === "interviewer" || value === "admin") {
                              setFormData({ ...formData, role: value })
                            }
                  
                            clearError('role')
                          }}
                          className={`w-full px-4 py-3 bg-[#0D1117]/80 border rounded-lg text-[#E6EDF3] focus:border-[#BC8CFF] focus:ring-[#BC8CFF]/20 h-12 text-lg backdrop-blur-sm transition-all duration-300 ${errors.role ? 'border-[#FF7B72]' : 'border-[#30363D]'
                            }`}
                        >
                          <option value="" disabled hidden>Select your role</option>
                          <option value="user">Candidate</option>
                          <option value="interviewer">Interviewer</option>
                        </select>
                        {errors.role && (
                          <p className="text-[#FF7B72] text-sm">{errors.role}</p>
                        )}
                      </motion.div>
                    </>
                  )}
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 h-12 text-lg font-semibold"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#30363D]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#161B22] px-2 text-[#7D8590]">Or continue with</span>
                  </div>
                </motion.div>

                {/* Google Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    className="bg-[#0D1117]/80 border-[#30363D] text-[#E6EDF3] hover:bg-[#21262D] hover:border-[#BC8CFF]/50 backdrop-blur-sm"
                  />
                </motion.div>

                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <a href="/auth/forgot-password" className="text-[#BC8CFF] hover:text-[#BC8CFF]/80 text-sm transition-colors">
                      Forgot your password?
                    </a>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={handleRoleModalClose}
        userName={googleUserName}
        isLoading={isGoogleLoading}
      />
    </>
  )
}