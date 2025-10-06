"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useAdminSessions } from "../../../hooks/useAdminSessions";
import { useDebounce } from "../../../hooks/useDebounce";
import { ReusableTable, TableColumn } from "../../../components/ui/ReusableTable";
import type { AdminBookingList } from "../../../types/booking.types";
import { BookingStatus } from "../../../types/booking.types";
import Paginator from "../../../components/ui/paginator";
import { Search, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "../../../components/ui/dialog";

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
  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { sessions, total, loading, error } = useAdminSessions(debouncedSearchTerm, page, pageSize); 

  const [selectedSession, setSelectedSession] = useState<AdminBookingList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  
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
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedSession(row);
            setIsModalOpen(true);
          }}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          <Eye className="w-4 h-4 mr-1" />
          Details
        </Button>
      ),
    },
  ];

  const dataWithIndex: Row[] = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sessions.map((s, i) => ({ ...s, index: start + i }));
  }, [sessions, page, pageSize]);

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

      {/* Search */}
      <motion.div className="glass-card rounded-xl p-6" variants={itemVariants}>
        <div className="relative max-w-8xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <motion.input
            type="text"
            placeholder="Search by user or interviewer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 input-glow rounded-lg text-white placeholder-gray-400 focus:outline-none text-lg"
            whileFocus={{ scale: 1.02 }}
          />
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
                • Page {page} of {Math.max(1, Math.ceil(total / pageSize))} • Total: {total} sessions
              </span>
            </div>
          </div>
        </div>

        <ReusableTable
          data={dataWithIndex}
          columns={columns}
          loading={loading}
          variant="admin"
          emptyMessage={searchTerm ? "No sessions match your search" : "No sessions found"}
        />
      </motion.div>

      {/* Pagination */}
      <Paginator
        page={page}
        totalItems={total}
        onPageChange={setPage}
        pageSize={pageSize}
        className="justify-center"
      />


      {/* Session Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Session Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the selected session.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Session ID:</span>
                <span className="text-white">{selectedSession.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Name:</span>
                <span className="text-white">{selectedSession.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Interviewer Name:</span>
                <span className="text-white">{selectedSession.interviewerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white"> {new Date(selectedSession.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="text-white">{selectedSession.startTime} - {selectedSession.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white capitalize">{selectedSession.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <StatusBadge status={selectedSession.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}