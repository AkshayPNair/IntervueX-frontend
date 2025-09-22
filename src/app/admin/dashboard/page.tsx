"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Monitor, MessageSquare, TrendingUp, Activity, UserCheck } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAdminWallet } from '@/hooks/useAdminWallet';


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

export default function Dashboard() {
  const { stats, recentActivity, loading, error, refetch, sessionSeries, usersSeries } = useAdminDashboard();
  const { transactions } = useAdminWallet();
  const [sessionRange, setSessionRange] = useState<'week' | 'month' | 'year'>('month');
  const [usersRange, setUsersRange] = useState<'week' | 'month' | 'year'>('month');

  // Compute Admin Wallet total amount (sum of all transaction amounts)
  const adminWalletTotalAmount = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.adminFee || 0), 0);

  // Map backend series to chart-friendly shapes
  const sessionData = (sessionSeries?.[sessionRange] || []).map(p => ({ name: p.name, sessions: p.value }));
  const usersData = (usersSeries?.[usersRange] || []).map(p => ({ name: p.name, users: p.value }));

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome to your futuristic admin control center</p>
        </div>
        <motion.div 
          className="flex items-center space-x-2 glass-card-light rounded-lg px-4 py-2"
          whileHover={{ scale: 1.05 }}
        >
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">{loading ? 'Loading…' : 'Live'}</span>
        </motion.div>
      </motion.div>

      {error && (
        <div className="glass-card-light text-red-400 rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={containerVariants}
      >
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          delay={0}
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={Monitor}
          delay={0.1}
        />
        <StatCard
          title="Total Amount"
          value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(adminWalletTotalAmount || 0)}
          icon={TrendingUp}
          delay={0.4}
        />
        <StatCard
          title="Total Interviews"
          value={stats.totalInterviews}
          icon={MessageSquare}
          delay={0.3}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={UserCheck}
          delay={0.2}
        />
      </motion.div>
      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Session Growth Chart */}
        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Session Growth</h2>
            <div className="flex items-center gap-2">
              {['Week', 'Month', 'Year'].map((label) => (
                <button
                  key={label}
                  onClick={() => setSessionRange(label.toLowerCase() as 'week' | 'month' | 'year')}
                  className={`px-3 py-1 rounded-md text-sm ${sessionRange === label.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                >
                  {label}
                </button>
              ))}
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(22, 27, 34, 0.9)', 
                  border: '1px solid rgba(188, 140, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#bc8cff" 
                strokeWidth={3}
                dot={{ fill: '#bc8cff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#bc8cff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Users Graph */}
        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <div className="flex items-center gap-2">
              {['Week', 'Month', 'Year'].map((label) => (
                <button
                  key={label}
                  onClick={() => setUsersRange(label.toLowerCase() as 'week' | 'month' | 'year')}
                  className={`px-3 py-1 rounded-md text-sm ${usersRange === label.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(22, 27, 34, 0.9)', 
                  border: '1px solid rgba(188, 140, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  backdropFilter: 'blur(10px)'
                }} 
              />
              <Bar dataKey="users" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="glass-card rounded-xl p-6"
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
      >
        <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
        {recentActivity.map((activity, index) => (
            <motion.div 
            key={activity.id}
              className="flex items-center space-x-4 p-4 glass-card-light rounded-lg table-row-glow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className={`w-3 h-3 rounded-full ${
                  activity.type === 'user_registration' ? 'bg-yellow-400' :
                  activity.type === 'interviewer_approval' ? 'bg-green-400' :
                  activity.type === 'booking_completed' ? 'bg-blue-400' :
                  activity.type === 'feedback_submitted' ? 'bg-purple-400' :
                  'bg-pink-400'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="flex-1">
              <div className="text-white font-medium">{activity.message}</div>
                <div className="text-gray-400 text-sm">
                  {activity.userName || activity.interviewerName || ''}
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}