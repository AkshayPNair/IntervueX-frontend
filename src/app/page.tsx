"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { Particle } from "@/components/ui/particle"
import { CodingLanguages } from "@/components/ui/coding-languages"
import { FAQItem } from "@/components/ui/faq-item"
import {
  Code,
  Video,
  Award,
  Target,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  Building,
  MapPin,
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => <Particle key={i} delay={i * 0.1} />)

  return (
    <>
     
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117] bg-gradient-to-r from-[#BC8CFF]/10 via-[#3B0A58]/10 to-[#BC8CFF]/10">
        <Navigation />
        {particles}

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-[#E6EDF3] via-[#BC8CFF] to-[#58A6FF] bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Master Your Technical Interviews
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-[#7D8590] mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Practice with experienced interviewers, solve coding challenges in real-time, and get personalized feedback
              to land your dream job at top tech companies.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <Button
                onClick={() => router.push("/auth")}
                className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                Start Practicing Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {[
                { number: "10K+", label: "Interviews Conducted" },
                { number: "500+", label: "Expert Interviewers" },
                { number: "95%", label: "Success Rate" },
                { number: "50+", label: "Top Companies" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#BC8CFF] mb-2">{stat.number}</div>
                  <div className="text-[#7D8590] text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Coding Languages Section */}
        <section className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#E6EDF3] mb-4">Practice in Your Favorite Languages</h2>
            <p className="text-[#7D8590]">Support for 15+ programming languages and frameworks</p>
          </div>
          <CodingLanguages />
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#E6EDF3] to-[#BC8CFF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Why Choose IntervueX?
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Code,
                  title: "Real-time Coding",
                  description: "Collaborate on code in real-time with industry-standard editors and instant compilation.",
                  color: "#BC8CFF",
                },
                {
                  icon: Video,
                  title: "HD Video Calls",
                  description: "Crystal clear video and audio communication with screen sharing capabilities.",
                  color: "#58A6FF",
                },
                {
                  icon: Award,
                  title: "Expert Feedback",
                  description: "Get detailed feedback from experienced developers and industry professionals.",
                  color: "#3FB950",
                },
                {
                  icon: Target,
                  title: "Personalized Learning",
                  description: "AI-powered recommendations based on your performance and career goals.",
                  color: "#FF7B72",
                },
                {
                  icon: Users,
                  title: "Community Support",
                  description: "Join a community of developers helping each other succeed.",
                  color: "#FFA657",
                },
                {
                  icon: TrendingUp,
                  title: "Track Progress",
                  description: "Monitor your improvement with detailed analytics and progress tracking.",
                  color: "#7C3AED",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group"
                >
                  <Card className="bg-[#161B22]/50 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300 h-full group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                    <CardHeader>
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}40` }}
                      >
                        <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                      </div>
                      <CardTitle className="text-[#E6EDF3] text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-[#7D8590] leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117]">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#E6EDF3] to-[#BC8CFF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Success Stories
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Software Engineer",
                  company: "Google",
                  image: "SC",
                  story:
                    "IntervueX helped me prepare for my Google interview. The real-time coding practice and expert feedback were invaluable.",
                  rating: 5,
                  location: "San Francisco, CA",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Full Stack Developer",
                  company: "Meta",
                  image: "MR",
                  story:
                    "The personalized feedback and mock interviews gave me the confidence I needed to ace my Meta interview.",
                  rating: 5,
                  location: "Seattle, WA",
                },
                {
                  name: "Emily Johnson",
                  role: "Senior Developer",
                  company: "Netflix",
                  image: "EJ",
                  story:
                    "Amazing platform! The interviewers are top-notch and the practice sessions are incredibly realistic.",
                  rating: 5,
                  location: "Los Angeles, CA",
                },
              ].map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D] hover:border-[#BC8CFF]/50 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-gradient-to-br from-[#BC8CFF] to-[#3B0A58] text-white text-lg font-bold">
                            {story.image}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-[#E6EDF3] font-bold text-lg">{story.name}</h3>
                          <p className="text-[#BC8CFF] font-semibold">{story.role}</p>
                          <div className="flex items-center space-x-2 text-sm text-[#7D8590]">
                            <Building className="w-4 h-4" />
                            <span>{story.company}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-[#7D8590]">
                            <MapPin className="w-4 h-4" />
                            <span>{story.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-[#3FB950] text-[#3FB950]" />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#7D8590] leading-relaxed italic">"{story.story}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#E6EDF3] to-[#BC8CFF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-4">
              {[
                {
                  question: "How does the real-time coding work?",
                  answer:
                    "Our platform uses advanced WebRTC technology to enable real-time collaboration on code with zero latency. You and your interviewer can see changes instantly as you type, just like pair programming in person.",
                },
                {
                  question: "Can I practice with different programming languages?",
                  answer:
                    "Yes! We support 15+ programming languages including Python, JavaScript, Java, C++, Go, Rust, Swift, and more. Our code editor provides syntax highlighting and auto-completion for all supported languages.",
                },
                {
                  question: "How are interviewers vetted?",
                  answer:
                    "All our interviewers are experienced professionals from top tech companies like Google, Meta, Amazon, and Netflix. They go through a rigorous screening process and must have at least 5 years of industry experience.",
                },
                {
                  question: "What kind of feedback will I receive?",
                  answer:
                    "You'll receive detailed feedback covering problem-solving approach, code quality, communication skills, and technical depth. Our interviewers provide specific recommendations for improvement and highlight your strengths.",
                },
                {
                  question: "How much does it cost?",
                  answer:
                    "We offer flexible pricing plans starting from $29/month for basic access. Premium plans include unlimited practice sessions, priority booking, and access to senior-level interviewers from FAANG companies.",
                },
                {
                  question: "Can I schedule interviews at my convenience?",
                  answer:
                    "Our platform operates 24/7 with interviewers available across different time zones. You can book sessions that fit your schedule, including evenings and weekends.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#BC8CFF]/10 via-[#3B0A58]/10 to-[#BC8CFF]/10 ">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#E6EDF3] to-[#BC8CFF] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Land Your Dream Job?
            </motion.h2>
            <motion.p
              className="text-xl text-[#7D8590] mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands of developers who have successfully prepared for their technical interviews with IntervueX.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                onClick={() => router.push("/auth")}
                className="bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58] hover:from-[#BC8CFF]/80 hover:to-[#3B0A58]/80 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-[0_0_25px_rgba(188,140,255,0.6)] transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey Today <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 border-t border-[#30363D] bg-[#0D1117]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#BC8CFF] to-[#58A6FF] bg-clip-text text-transparent mb-4">
                  IntervueX
                </div>
                <p className="text-[#7D8590] mb-4">
                  Master your technical interviews with expert guidance and real-time practice.
                </p>
              </div>
              <div>
                <h4 className="text-[#E6EDF3] font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-[#7D8590]">
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Interviewers
                    </a>
          </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#E6EDF3] font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-[#7D8590]">
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      About
                    </a>
          </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Blog
                    </a>
                  </li>
                </ul>
        </div>
              <div>
                <h4 className="text-[#E6EDF3] font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-[#7D8590]">
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#BC8CFF] transition-colors">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[#30363D] pt-8 text-center">
              <p className="text-[#7D8590]">© 2024 IntervueX. All rights reserved.</p>
            </div>
          </div>
      </footer>

        
    </div>
    </>
  )
}