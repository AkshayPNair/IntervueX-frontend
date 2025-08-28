"use client"

import { useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read optional query params for nicer UX if caller passes them
  const details = useMemo(() => {
    const date = searchParams.get("date") || ""
    const time = searchParams.get("time") || ""
    const interviewer = searchParams.get("interviewer") || ""
    const amount = searchParams.get("amount") || ""
    const ref = searchParams.get("ref") || ""

    return { date, time, interviewer, amount, ref }
  }, [searchParams])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] text-white relative overflow-hidden"
    >
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
        <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="bg-[#161B22]/80 border border-[#30363D] rounded-3xl">
              <CardHeader className="text-center space-y-4">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-[#3FB950]" />
                </motion.div>
                <CardTitle className="text-3xl font-semibold text-[#E6EDF3]">
                  Booking Confirmed!
                </CardTitle>
                <p className="text-[#7D8590]">
                  Your slot has been successfully booked. A confirmation has been sent to your email.
                </p>
              </CardHeader>
              <CardContent>
                {(details.date || details.time || details.interviewer || details.amount || details.ref) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-2 mb-6 rounded-2xl border border-[#30363D] bg-[#0D1117]/50 p-5">
                    <div className="grid grid-cols-1 gap-3 text-sm text-[#E6EDF3]">
                      {details.interviewer && (
                        <div className="flex justify-between">
                          <span className="text-[#7D8590]">Interviewer</span>
                          <span className="font-medium">{details.interviewer}</span>
                        </div>
                      )}
                      {details.date && (
                        <div className="flex justify-between">
                          <span className="text-[#7D8590]">Date</span>
                          <span className="font-medium">{details.date}</span>
                        </div>
                      )}
                      {details.time && (
                        <div className="flex justify-between">
                          <span className="text-[#7D8590]">Time</span>
                          <span className="font-medium">{details.time}</span>
                        </div>
                      )}
                      {details.amount && (
                        <div className="flex justify-between">
                          <span className="text-[#7D8590]">Amount</span>
                          <span className="font-medium">₹ {details.amount}</span>
                        </div>
                      )}
                      {details.ref && (
                        <div className="flex justify-between">
                          <span className="text-[#7D8590]">Reference</span>
                          <span className="font-medium">{details.ref}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/user/sessions")}
                    className="w-full bg-gradient-to-r from-[#BC8CFF] to-[#3B0A58]"
                  >
                    View My Sessions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/user/dashboard")}
                    className="w-full border-[#30363D] text-[#E6EDF3]"
                  >
                    Go to Dashboard
                  </Button>
                </div>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}