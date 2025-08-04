"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Monitor, MessageSquare, Code, TrendingUp, Activity, Zap, Globe, UserCheck, Clock } from 'lucide-react';
import StatCard from '../../../components/ui/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const sessionData = [
  { name: 'Jan', sessions: 120, active: 89 },
  { name: 'Feb', sessions: 150, active: 110 },
  { name: 'Mar', sessions: 180, active: 145 },
  { name: 'Apr', sessions: 220, active: 178 },
  { name: 'May', sessions: 280, active: 225 },
  { name: 'Jun', sessions: 350, active: 290 },
];

const compilerData = [
  { name: 'Python', value: 45, color: '#bc8cff' },
  { name: 'JavaScript', value: 30, color: '#8b5cf6' },
  { name: 'Java', value: 15, color: '#a855f7' },
  { name: 'C++', value: 10, color: '#9333ea' },
];

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
          <span className="text-sm text-gray-300">Live • 2 min ago</span>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={containerVariants}
      >
        <StatCard
          title="Total Users"
          value="2,847"
          icon={Users}
          change={{ value: '+12% from last month', type: 'increase' }}
          delay={0}
        />
        <StatCard
          title="Active Sessions"
          value="156"
          icon={Monitor}
          change={{ value: '+8% from last hour', type: 'increase' }}
          delay={0.1}
        />
        <StatCard
          title="Pending Requests"
          value="3"
          icon={UserCheck}
          change={{ value: '2 new today', type: 'increase' }}
          delay={0.2}
        />
        <StatCard
          title="Total Interviews"
          value="8,432"
          icon={MessageSquare}
          change={{ value: '+15% from last week', type: 'increase' }}
          delay={0.3}
        />
        <StatCard
          title="Compiler Requests"
          value="45,678"
          icon={Code}
          change={{ value: '+23% from yesterday', type: 'increase' }}
          delay={0.4}
        />
      </motion.div>

      {/* Performance Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">System Performance</h3>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">CPU Usage</span>
              <span className="text-green-400 font-medium">23%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '23%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Memory</span>
              <span className="text-blue-400 font-medium">67%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '67%' }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Network</span>
              <span className="text-purple-400 font-medium">45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Global Reach</h3>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-4">
            {[
              { country: 'United States', users: 1247, color: 'from-blue-400 to-blue-600' },
              { country: 'United Kingdom', users: 892, color: 'from-purple-400 to-purple-600' },
              { country: 'Germany', users: 634, color: 'from-pink-400 to-pink-600' },
              { country: 'Canada', users: 423, color: 'from-green-400 to-green-600' },
            ].map((item, index) => (
              <motion.div 
                key={item.country}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
                  <span className="text-gray-300 text-sm">{item.country}</span>
                </div>
                <span className="text-white font-medium">{item.users}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Export Reports', action: 'export' },
              { label: 'System Backup', action: 'backup' },
              { label: 'Send Notifications', action: 'notify' },
              { label: 'Update Settings', action: 'settings' },
            ].map((item, index) => (
              <motion.button
                key={item.action}
                className="w-full glow-button text-white px-4 py-2 rounded-lg text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
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
            <TrendingUp className="w-5 h-5 text-green-400" />
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
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compiler Usage Chart */}
        <motion.div 
          className="glass-card rounded-xl p-6"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">Compiler Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={compilerData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {compilerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(22, 27, 34, 0.9)', 
                  border: '1px solid rgba(188, 140, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  backdropFilter: 'blur(10px)'
                }} 
              />
            </PieChart>
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
          {[
            { time: '2 min ago', action: 'New interview request submitted', details: 'Sarah Johnson → Alex Chen', type: 'request' },
            { time: '5 min ago', action: 'Interview session completed', details: 'Python Backend Engineer', type: 'session' },
            { time: '8 min ago', action: 'Request approved by admin', details: 'Michael Rodriguez → Emma Wilson', type: 'approval' },
            { time: '12 min ago', action: 'Feedback submitted', details: 'Rating: 4.5/5', type: 'feedback' },
            { time: '15 min ago', action: 'New admin user promoted', details: 'sarah.admin@company.com', type: 'admin' },
          ].map((activity, index) => (
            <motion.div 
              key={index} 
              className="flex items-center space-x-4 p-4 glass-card-light rounded-lg table-row-glow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className={`w-3 h-3 rounded-full ${
                  activity.type === 'request' ? 'bg-yellow-400' :
                  activity.type === 'approval' ? 'bg-green-400' :
                  activity.type === 'session' ? 'bg-blue-400' :
                  activity.type === 'feedback' ? 'bg-purple-400' :
                  'bg-red-400'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <div className="flex-1">
                <div className="text-white font-medium">{activity.action}</div>
                <div className="text-gray-400 text-sm">{activity.details}</div>
              </div>
              <div className="text-gray-400 text-sm">{activity.time}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}