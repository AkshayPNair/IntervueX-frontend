"use client";

import React, { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useAdminSessions } from "../../../hooks/useAdminSessions";
import { ReusableTable, TableColumn } from "../../../components/ui/ReusableTable";
import type { AdminBookingList } from "../../../types/booking.types";
import { BookingStatus } from "../../../types/booking.types";
import Paginator from "../../../components/ui/paginator";
import { Search, Calendar } from "lucide-react";

// Small helper to format date ranges (fallback-safe)
const formatDateRange = (date: string, startTime: string, endTime: string) => {
  const d = new Date(date);
  const dateStr = isNaN(d.getTime()) ? date : d.toLocaleDateString();
  return `${dateStr} • ${startTime} - ${endTime}`;
};

// Status badge using span as requested
const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center";
  const classes =
    status === BookingStatus.CONFIRMED
      ? "bg-blue-500/10 text-blue-300 border border-blue-400/20"
      : status === BookingStatus.COMPLETED
      ? "bg-green-500/10 text-green-300 border border-green-400/20"
      : status === BookingStatus.CANCELLED
      ? "bg-rose-500/10 text-rose-300 border border-rose-400/20"
      : "bg-yellow-500/10 text-yellow-300 border border-yellow-400/20"; // pending
  return <span className={`${base} ${classes}`}>{status}</span>;
};

export default function AdminSessionsPage() {
  const { sessions, loading, error } = useAdminSessions();

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const pageSize = 6; 

  // Derived filtering
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const isToday = (d: Date) =>
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const isThisWeek = (d: Date) => {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      return d >= firstDayOfWeek && d <= lastDayOfWeek;
    };

    const isThisMonth = (d: Date) =>
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

    return sessions.filter((s) => {
      // Search by user or interviewer name
      const matchesSearch = (
        s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.interviewerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Status filter
      const matchesStatus =
        statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "All") {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) {
          if (dateFilter === "Today") matchesDate = isToday(d);
          else if (dateFilter === "Week") matchesDate = isThisWeek(d);
          else if (dateFilter === "Month") matchesDate = isThisMonth(d);
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [sessions, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const pagedSessions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, page]);

  // Columns for table (improved rendering)
  type Row = (AdminBookingList & { index: number });
  const columns: TableColumn<Row>[] = [
    {
      key: "index",
      header: "#",
      width: "60px",
      render: (row) => <span className="text-purple-300 font-semibold">{row.index + 1}</span>,
    },
    {
      key: "userName",
      header: "User",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{row.userName}</span>
          <span className="text-xs text-gray-400">Attendee</span>
        </div>
      ),
    },
    {
      key: "interviewerName",
      header: "Interviewer",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{row.interviewerName}</span>
          <span className="text-xs text-gray-400">Host</span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Schedule",
      render: (row) => (
        <span className="text-purple-300">
          {formatDateRange(row.date, row.startTime, row.endTime)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const dataWithIndex: Row[] = useMemo(() => {
    const start = (page - 1) * pageSize;
    return pagedSessions.map((s, i) => ({ ...s, index: start + i }));
  }, [pagedSessions, page]);

  // Animations (reuse from wallet style)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
  };

  return (
    <motion.div
      className="space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-4xl font-bold gradient-text">Session Monitor</h1>
          <p className="text-gray-400 mt-2">Track all platform sessions with filters, search, and pagination</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="glass-card rounded-xl p-6" variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <motion.input
              type="text"
              placeholder="Search by user or interviewer..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 input-glow rounded-lg text-white placeholder-gray-400 focus:outline-none text-lg"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          {/* Status */}
          <motion.select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-3 input-glow rounded-lg text-white focus:outline-none text-lg"
            whileFocus={{ scale: 1.02 }}
          >
            <option value="All">All Status</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.COMPLETED}>Completed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </motion.select>

          {/* Date */}
          <motion.select
            value={dateFilter}
            onChange={(e) => {
              setPage(1);
              setDateFilter(e.target.value);
            }}
            className="px-4 py-3 input-glow rounded-lg text-white focus:outline-none text-lg"
            whileFocus={{ scale: 1.02 }}
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </motion.select>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants} className="text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="table-glow rounded-xl overflow-hidden" variants={itemVariants}>
        <div className="px-8 py-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">All Sessions</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">
                • Page {page} of {Math.max(1, Math.ceil(filteredSessions.length / pageSize))}
              </span>
            </div>
          </div>
        </div>

        <ReusableTable
          data={dataWithIndex}
          columns={columns}
          loading={loading}
          variant="admin"
          emptyMessage={searchTerm || statusFilter !== "All" || dateFilter !== "All" ? "No sessions match your filters" : "No sessions found"}
        />
      </motion.div>

      {/* Pagination */}
      <Paginator
        page={page}
        totalItems={filteredSessions.length}
        onPageChange={setPage}
        pageSize={pageSize}
        className="justify-center"
      />
    </motion.div>
  );
}