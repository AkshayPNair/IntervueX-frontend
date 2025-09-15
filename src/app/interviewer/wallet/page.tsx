"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, TrendingUp, DollarSign, Plus, Calendar, CreditCard, History, Zap, User, Clock, Award } from "lucide-react";
import ParticleBackground from "../../../components/ui/ParticleBackground";
import { useInterviewerWallet } from "@/hooks/useInterviewerWallet";
import { WalletTransaction } from "../../../types/wallet.types";
import { useState, useMemo } from "react";
import Paginator from "../../../components/ui/paginator";

const getUserName = (transaction: WalletTransaction): string => {
 return transaction.userName || `User ${transaction.userId?.slice(-4) || 'Unknown'}`
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount)
}

const Wallet = () => {
  const { summary, transactions, loading, error } = useInterviewerWallet()
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalEarning = transactions
    .filter(tnx => tnx.type === 'credit')
    .reduce((sum, tnx) => sum + (tnx.interviewerFee || 0), 0);
  const thisMonthEarning = transactions
    .filter(tnx => new Date(tnx.createdAt).getMonth() === new Date().getMonth() && tnx.type === 'credit')
    .reduce((sum, tnx) => sum + (tnx.interviewerFee || 0), 0);
  const totalCredits = transactions.filter(tnx => tnx.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(tnx => tnx.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const pagedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize
    return transactions.slice(start, start + pageSize)
  }, [transactions, page])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58] relative">
      <ParticleBackground />

      <main className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient-static text-left">Wallet Dashboard</h1>
          <p className="text-xl text-purple-300 mt-2">Manage your earnings and transactions</p>
        </div>

        {/* Earning Stats - 2 Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Earning Block */}
          <div className="card-futuristic p-8 bg-gradient-to-br from-purple-500/20 to-blue-600/20 animate-scale-in rounded-2xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                    <WalletIcon className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300">Total Earning</h3>
                    <p className="text-sm text-purple-400">All time earnings</p>
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gradient-static mb-2">
                  {loading ? "—" : formatCurrency(summary.balance)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">+12.5% from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* This Month Earning Block */}
          <div className="card-futuristic p-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 animate-scale-in rounded-2xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                    <Calendar className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">This Month</h3>
                    <p className="text-sm text-green-400">January 2024</p>
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gradient-static mb-2">
                  ₹{thisMonthEarning.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details Table */}
        <div className="card-futuristic p-8 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <History className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gradient">Transaction Details</h2>
              <p className="text-purple-300">Complete transaction history</p>
            </div>
          </div>

          <div className="rounded-xl border border-purple-400/20 overflow-hidden glass-effect">
            <Table>
              <TableHeader>
                <TableRow className="border-purple-400/20 hover:bg-purple-500/10 bg-purple-500/5">
                  <TableHead className="text-purple-400 font-semibold py-4">ID</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Name</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Reason</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Amount</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Commission</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Your Earning</TableHead>
                  <TableHead className="text-purple-400 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                        <span className="text-purple-300">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <span className="text-red-400">{error}</span>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <span className="text-purple-300">No transactions found</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedTransactions.map((transaction, index) => {
                    const userName = getUserName(transaction);
                    const { date, time } = formatDateTime(transaction.createdAt);

                    return (
                      <TableRow
                        key={transaction.id}
                        className="border-purple-400/10 hover:bg-purple-500/5 transition-all duration-300 group"
                      >
                        <TableCell className="font-semibold py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                            {((page - 1) * pageSize) + index + 1}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-white">
                              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">{userName}</p>
                              <p className="text-xs text-purple-300">{time}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.reason.toLowerCase().includes('cancel') ? (
                              <User className="h-4 w-4 text-red-400" />
                            ) : (
                              <Award className="h-4 w-4 text-green-400" />
                            )}
                            <span className="font-medium text-white">
                              {transaction.reason}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg text-white">
                            ₹{transaction.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-yellow-400">
                          ₹{(transaction.adminFee || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg text-green-400">
                          ₹{(transaction.interviewerFee || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-2 font-semibold transition-all duration-300 ${transaction.type === 'credit'
                                ? 'text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20'
                                : 'text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20'
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              {transaction.type === 'credit' ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingUp className="h-3 w-3 rotate-180" />
                              )}
                              {transaction.type.toUpperCase()}
                            </span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Pagination */}
          {!loading && transactions.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Paginator
                page={page}
                totalItems={transactions.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
      </main>
    </div>
  );
};

export default Wallet;