"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FloatingMascot } from "@/components/ui/floating-mascot"
import { UseUserWallet } from "@/hooks/useUserWallet"
import Paginator from "../../../components/ui/paginator";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

export default function WalletPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const {summary,transactions,loading,error}=UseUserWallet()
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "all") return transactions
    return transactions.filter((t) => t.type === selectedFilter)
  }, [transactions, selectedFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, page])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] text-white relative overflow-x-hidden">
      
      <div className="min-h-screen pt-16 bg-gradient-to-br from-[#0D1117] to-[#161B22]">
        {/* Header */}
        <div className="bg-[#161B22]/80 backdrop-blur-xl border-b border-[#30363D]/50 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#E6EDF3] mb-2">My Wallet</h1>
                <p className="text-[#7D8590] text-lg">Manage your balance and transactions</p>
              </div>
              <div className="flex items-center space-x-4"> </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Current Balance Only */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-[#BC8CFF]/20 via-[#3B0A58]/20 to-[#BC8CFF]/20 backdrop-blur-md border-[#BC8CFF]/30 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#BC8CFF]/10 to-[#3B0A58]/10" />
              <CardContent className="p-12 relative z-10 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-[#BC8CFF]/20 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-[#BC8CFF]" />
                  </div>
                </div>
                <h3 className="text-[#E6EDF3] font-semibold text-2xl mb-2">Current Balance</h3>
                <p className="text-[#7D8590] text-lg mb-6">Available for use</p>
                <div className="text-6xl font-bold text-[#E6EDF3] mb-4">
                {loading ? "—" : formatCurrency(summary.balance)}
                </div>
                <Badge className="bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30 text-lg px-4 py-2">
                {loading ? "Loading" : "Active"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transactions Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#161B22]/80 backdrop-blur-md border-[#30363D]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E6EDF3] text-2xl flex items-center">
                    <CreditCard className="w-6 h-6 mr-3 text-[#58A6FF]" />
                    Transaction History
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-[#0D1117]/80 rounded-lg p-1">
                      {[
                        { id: "all", label: "All" },
                        { id: "credit", label: "Credit" },
                        { id: "debit", label: "Debit" },
                      ].map((filter) => (
                        <motion.button
                          key={filter.id}
                          onClick={() => setSelectedFilter(filter.id)}
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
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Reason</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Date & Time</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Amount</th>
                        <th className="text-left py-4 px-2 text-[#7D8590] font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                    {loading? [] : paged.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
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
                          <div className="text-[#E6EDF3] font-medium">{transaction.reason}</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-[#E6EDF3]">{formatDateTime(transaction.createdAt)}</div>
                          </td>
                          <td className="py-4 px-2">
                            <div className={`font-semibold flex items-center ${
                              transaction.type === 'credit' ? 'text-[#3FB950]' : 'text-[#FF7B72]'
                            }`}>
                              {transaction.type === 'credit' ? (
                                <ArrowDownLeft className="w-4 h-4 mr-1" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                              )}
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge
                              className={`${
                                transaction.type === 'credit'
                                  ? 'bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30'
                                  : 'bg-[#FF7B72]/20 text-[#FF7B72] border-[#FF7B72]/30'
                              }`}
                            >
                              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#30363D]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-[#7D8590]" />
                    </div>
                    <h3 className="text-[#E6EDF3] font-semibold mb-2">No transactions found</h3>
                    <p className="text-[#7D8590]">No transactions match your current filter.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
         {!loading && filteredTransactions.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <Paginator
                        page={page}
                        totalItems={transactions.length}
                        pageSize={pageSize}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
      </div>
      <FloatingMascot />
    </div>
  )
}