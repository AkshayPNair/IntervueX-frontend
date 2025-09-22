"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserPaymentHistory } from "@/hooks/useUserPaymentHistory"
import Paginator from "../../../components/ui/paginator";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  CreditCard,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  IndianRupeeIcon,
} from "lucide-react"

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount)
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function PaymentHistoryPage() {
 const { stats, payments, loading } = useUserPaymentHistory()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'cancelled' | 'confirmed' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filteredPayments = useMemo(() => {
    if (!payments) return []
    if (selectedFilter === 'all') return payments
    return payments.filter(p => p.status === selectedFilter)
  }, [payments, selectedFilter])

  const pagedPayments = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, page])

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'wallet':
        return <IndianRupeeIcon className="w-4 h-4" />
      case 'razorpay':
       default:
         return <CreditCard className="w-4 h-4" />
     }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">Payment History</h1>
                <p className="text-[#7D8590] text-lg">Track your session payments and transactions</p>
              </div>
              <div className="flex items-center space-x-4">
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-[#BC8CFF]/20 via-[#3B0A58]/20 to-[#BC8CFF]/20 backdrop-blur-md border-[#BC8CFF]/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#BC8CFF]/10 to-[#3B0A58]/10" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#BC8CFF]/20 rounded-2xl flex items-center justify-center border border-[#BC8CFF]/40">
                      <Users className="w-7 h-7 text-[#BC8CFF]" />
                    </div>
                    
                  </div>
                  <div className="text-4xl font-bold text-[#E6EDF3] mb-2">{loading ? '—' : stats.totalBooked}</div>
                  <div className="text-[#7D8590] text-lg font-medium">Total Sessions</div>
                  <div className="text-[#BC8CFF] text-sm mt-2">All time sessions booked</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Completed Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-[#3FB950]/20 via-[#2EA043]/20 to-[#3FB950]/20 backdrop-blur-md border-[#3FB950]/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3FB950]/10 to-[#2EA043]/10" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#3FB950]/20 rounded-2xl flex items-center justify-center border border-[#3FB950]/40">
                      <CheckCircle className="w-7 h-7 text-[#3FB950]" />
                    </div>
                    
                  </div>
                  <div className="text-4xl font-bold text-[#E6EDF3] mb-2">{loading ? '—' : stats.completed}</div>
                  <div className="text-[#7D8590] text-lg font-medium">Completed Sessions</div>
                  <div className="text-[#3FB950] text-sm mt-2">Successfully completed</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cancelled Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-gradient-to-br from-[#FF7B72]/20 via-[#F85149]/20 to-[#FF7B72]/20 backdrop-blur-md border-[#FF7B72]/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B72]/10 to-[#F85149]/10" />
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#FF7B72]/20 rounded-2xl flex items-center justify-center border border-[#FF7B72]/40">
                      <XCircle className="w-7 h-7 text-[#FF7B72]" />
                    </div>
                    
                  </div>
                  <div className="text-4xl font-bold text-[#E6EDF3] mb-2">{loading ? '—' : stats.cancelled}</div>
                  <div className="text-[#7D8590] text-lg font-medium">Cancelled Sessions</div>
                  <div className="text-[#FF7B72] text-sm  mt-2">Cancelled or refunded</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Payment History Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E6EDF3] text-2xl flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-[#58A6FF]" />
                    Payment History
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-[#0D1117]/80 rounded-lg p-1">
                      {[
                        { id: "all", label: "All" },
                        { id: "completed", label: "Completed" },
                        { id: "cancelled", label: "Cancelled" },
                      ].map((filter) => (
                        <motion.button
                          key={filter.id}
                          onClick={() => setSelectedFilter(filter.id as any)}
                          className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                            selectedFilter === filter.id
                              ? "bg-[#BC8CFF]/20 text-[#BC8CFF] shadow-lg"
                              : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#30363D]/50"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {filter.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#30363D]">
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">ID</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Date</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Amount</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Payment Method</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Status</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Interviewer</th>
                      </tr>
                    </thead>
                    <tbody>
                    {loading ? null : pagedPayments.map((payment, index) => (
                        <motion.tr
                          key={payment.bookingId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-[#30363D]/50 hover:bg-[#30363D]/20 transition-colors duration-200"
                        >
                          <td className="py-4 px-2">
                            <div className="w-8 h-8 bg-[#BC8CFF]/20 rounded-lg flex items-center justify-center">
                            <span className="text-[#BC8CFF] font-semibold text-sm">{(((page-1)*pageSize)+index+1).toString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-[#E6EDF3] font-medium">{formatDate(payment.date)}</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-[#E6EDF3] font-semibold">{formatCurrency(payment.amount)}</div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge className="bg-[#30363D] text-[#E6EDF3] border-[#484F58] flex items-center gap-2">
                              {getPaymentMethodIcon(payment.paymentMethod)} {payment.paymentMethod}
                            </Badge>
                          </td>
                          <td className="py-4 px-2">
                          {payment.status === 'completed' && (
                              <Badge className="bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30">Completed</Badge>
                            )}
                            {payment.status === 'confirmed' && (
                              <Badge className="bg-[#58A6FF]/20 text-[#58A6FF] border-[#58A6FF]/30">Booked</Badge>
                            )}
                            {payment.status === 'cancelled' && (
                              <Badge className="bg-[#FF7B72]/20 text-[#FF7B72] border-[#FF7B72]/30">Cancelled</Badge>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-[#E6EDF3] font-medium">{payment.interviewerName || '—'}</div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && payments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#30363D]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-[#7D8590]" />
                    </div>
                    <h3 className="text-[#E6EDF3] font-semibold mb-2">No payment records</h3>
                    <p className="text-[#7D8590]">Your payments will appear here after you book sessions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          {/* Pagination */}
          {!loading && filteredPayments.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Paginator
                page={page}
                totalItems={filteredPayments.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}