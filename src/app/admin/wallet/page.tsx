"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReusableTable, TableColumn } from '@/components/ui/ReusableTable';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { useDebounce } from '@/hooks/useDebounce';
import { WalletTransaction } from '@/types/wallet.types';
import Paginator from "../../../components/ui/paginator";
import {
  Wallet as WalletIcon,
  TrendingUp,
  DollarSign,
  Search,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  MoreHorizontal,
  User,
  Award,
  IndianRupeeIcon,

} from 'lucide-react';

const getUserName = (transaction: WalletTransaction): string => {
  return transaction.userName || `User ${transaction.userId?.slice(-4) || 'Unknown'}`
};


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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Wallet() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { summary, transactions, loading, error} = useAdminWallet(debouncedSearch);
  
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Calculate totals
  const totalEarnings =transactions
  .filter(t => t.type === 'credit')
  .reduce((sum, t) => sum + (t.adminFee || 0), 0);
  const thisMonthEarnings = transactions
    .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth() && t.type === 'credit')
    .reduce((sum, t) => sum + (t.adminFee || 0), 0);

  // Totals for gross amount and commission
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const thisMonthAmount = transactions
    .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (t.adminFee || 0), 0);
  const thisMonthCommission = transactions
    .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + (t.adminFee || 0), 0);



  const getStatusColor = (status: string) => {
    return status === 'Credit'
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
  };

  const getStatusIcon = (status: string) => {
    return status === 'Credit' ? ArrowUpRight : ArrowDownLeft;
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text">Admin Wallet</h1>
          <p className="text-gray-400 mt-2">Track your commission earnings and transaction history</p>
        </div>

      </motion.div>

      {/* Earnings Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={containerVariants}
      >
        {/* Total Earnings Card */}
        <motion.div
          className="glass-card rounded-2xl p-8 relative overflow-hidden"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center pulse-glow">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <TrendingUp className="w-6 h-6 text-green-400" />
              </motion.div>
            </div>
            <div>
              <p className="text-gray-400 text-lg font-medium mb-2">Total Earnings</p>
              <motion.p
                className="text-4xl font-bold text-green-400 glow-text mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {loading ? "—" : formatCurrency(totalEarnings)}
              </motion.p>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">↗ +12.5%</span>
                <span className="text-gray-400 text-sm">from last month</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* This Month Earnings Card */}
        <motion.div
          className="glass-card rounded-2xl p-8 relative overflow-hidden"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center pulse-glow">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <IndianRupeeIcon className="w-6 h-6 text-blue-400" />
              </motion.div>
            </div>
            <div>
              <p className="text-gray-400 text-lg font-medium mb-2">This Month</p>
              <motion.p
                className="text-4xl font-bold text-green-400 glow-text mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                ₹{thisMonthEarnings.toLocaleString('en-IN')}
              </motion.p>
              
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 text-sm font-medium">January 2024</span>
                <span className="text-gray-400 text-sm">• {transactions.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length} transactions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="glass-card rounded-xl p-6"
        variants={itemVariants}
      >
        <div className="relative max-w-8xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <motion.input
            type="text"
            placeholder="Search transactions by user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 input-glow rounded-lg text-white placeholder-gray-400 focus:outline-none text-lg"
            whileFocus={{ scale: 1.02 }}
          />
        </div>
      </motion.div>

      {/* Transaction Table */}
      <motion.div
        className="table-glow rounded-xl overflow-hidden"
        variants={itemVariants}
      >
        <div className="px-8 py-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Transaction History</h2>
            <div className="flex items-center space-x-4">
              <motion.button
                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
              </motion.button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <span className="ml-3 text-purple-300">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-red-400">{error}</span>
          </div>
        ) : (() => {
          const INR = (v: number) => `₹${v.toLocaleString('en-IN')}`;
          type Row = typeof transactions[0] & { seq: number };
          const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);
          const tableData: Row[] = paginatedTransactions.map((t, i) => ({ ...t, seq: ((page - 1) * pageSize) + i + 1 }));

          const columns: TableColumn<Row>[] = [
            {
              key: 'id',
              header: 'ID',
              width: '80px',
              render: (item) => <span className="text-purple-300 font-semibold">{item.seq}</span>,
            },
            {
              key: 'name',
              header: 'Name',
              render: (item) => {
                const userName = getUserName(item);
                const { time } = formatDateTime(item.createdAt);
                return (
                  <div className="flex flex-col">
                    <div className="text-white font-medium">{userName}</div>
                    <span className="text-xs text-gray-400 mt-1">{time}</span>
                  </div>
                );
              },
            },
            {
              key: 'reason',
              header: 'Reason',
              render: (item) => <span className="text-purple-300">{item.reason}  </span>,
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (item) => <span className="text-white font-semibold">{INR(item.amount)}</span>,
            },
            {
              key: 'commission',
              header: 'Commission',
              render: (item) => <span className="text-yellow-400 font-semibold">{INR(item.adminFee || 0)}</span>,
            },
            {
              key: 'yourEarning',
              header: 'Your Earning',
              render: (item) => (
                <span className={
                  item.type === 'debit' ? 'text-red-400 font-bold' : 'text-green-400 font-bold'
                }>
                  {INR(item.adminFee || 0)}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <span
                  className={
                    'inline-flex px-3 py-1 rounded-full text-sm font-semibold ' +
                    (item.type === 'credit'
                      ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30'
                      : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30')
                  }
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
              ),
            },
          ];

          return (
            <ReusableTable<Row>
              data={tableData}
              columns={columns}
              variant="admin"
              emptyMessage="No transactions found"
            />
          );
        })()}
      </motion.div>
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

    </motion.div>
  );
}