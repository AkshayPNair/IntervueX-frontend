"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ReusableTable, TableColumn } from '../../../components/ui/ReusableTable';
import Paginator from '../../../components/ui/paginator';
import { useAdminUsers } from '../../../hooks/useAdminUsers';
import { blockUser, unblockUser } from '../../../services/adminService';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Accept any string, since backend may send 'user'
  isBlocked: boolean;
  totalSessions: number;
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

export default function UserManagement() {
  const { users, loading, error } = useAdminUsers();
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (users.length > 0) {
      setLocalUsers(users);
    }
  }, [users]);

  // Filter out Admins from the user list
  const filteredUsers = useMemo(() => {
    const list = localUsers
      .filter(user => user.role !== 'Admin' && user.role !== 'admin')
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const userRoleForFilter = user.role === 'user' ? 'Candidate' : user.role;
        const matchesRole = roleFilter === 'All' || userRoleForFilter === roleFilter;
        const matchesStatus = statusFilter === 'All' || user.isBlocked === (statusFilter === 'Blocked');
        return matchesSearch && matchesRole && matchesStatus;
      });
    // reset to page 1 when filters/search change
    setPage(1);
    return list;
  }, [localUsers, searchTerm, roleFilter, statusFilter]);

  // current page slice
  const totalItems = filteredUsers.length;
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      const targetUser = localUsers.find(user => user.id === userId);
      if (targetUser && !targetUser.isBlocked) {
        await blockUser(userId);
        toast.success(`User blocked successfully`);
      } else {
        await unblockUser(userId);
        toast.success(`User unblocked successfully`);
      }
      setLocalUsers(users =>
        users.map(user =>
          user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        )
      )
     
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  // Define table columns
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      header: 'user',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => {
        // If user.role is 'user', show badge as 'Candidate'
        let badgeText = '';
        let badgeClass = '';
        if (user.role === 'Interviewer') {
          badgeText = 'Interviewer';
          badgeClass = 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
        } else if (user.role === 'user') {
          badgeText = 'Candidate';
          badgeClass = 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
        } else if (user.role === 'Candidate') {
          badgeText = 'Candidate';
          badgeClass = 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
        } else {
          badgeText = user.role.charAt(0).toUpperCase() + user.role.slice(1);
          badgeClass = 'bg-gradient-to-r from-gray-500 to-gray-700 text-white';
        }
        return (
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
            {badgeText}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.isBlocked
            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          }`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center">
          {user.isBlocked === false ? (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await handleToggleStatus(user.id);
              }}
              disabled={actionLoading === user.id}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold shadow-sm border border-red-400 bg-red-500/80 hover:bg-red-500 text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              title="Block User"
            >
              {actionLoading === user.id ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                </svg>
              )}
              <span>Block</span>
            </button>
          ) : (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await handleToggleStatus(user.id);
              }}
              disabled={actionLoading === user.id}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold shadow-sm border border-green-400 bg-green-500/80 hover:bg-green-500 text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              title="Unblock User"
            >
              {actionLoading === user.id ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              )}
              <span>Unblock</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleRowClick = (user: User) => {
    console.log('User clicked:', user);
  };

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
          <h1 className="text-3xl font-bold gradient-text">User Management</h1>
          <p className="text-gray-400 mt-1">Manage and monitor all platform users</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="glass-card rounded-lg p-3"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-400 w-3 h-3" />
            <motion.input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-2 input-glow rounded text-white placeholder-gray-400 focus:outline-none text-sm"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          <motion.select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2 py-2 input-glow rounded text-white focus:outline-none text-sm"
            whileFocus={{ scale: 1.01 }}
          >
            <option value="All">All Roles</option>
            <option value="Candidate">Candidate</option>
            <option value="Interviewer">Interviewer</option>
          </motion.select>

          <motion.select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-2 input-glow rounded text-white focus:outline-none text-sm"
            whileFocus={{ scale: 1.01 }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <ReusableTable
          data={pagedUsers}
          columns={columns}
          title="Users"
          onRowClick={handleRowClick}
        />
        <div className="mt-4 flex justify-center">
          <Paginator
            page={page}
            totalItems={totalItems}
            onPageChange={setPage}
            pageSize={pageSize}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}