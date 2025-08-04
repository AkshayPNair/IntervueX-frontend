import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../app/lib/utils';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

export interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  loading?: boolean;
  className?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  variant?: 'admin' | 'interviewer'; // Add this line
}

export function ReusableTable<T extends { id?: string | number }>({
  data,
  columns,
  title,
  loading = false,
  className,
  onRowClick,
  emptyMessage = "No data available",
  variant = 'admin' // Add this line
}: ReusableTableProps<T>) {
  
  // Add this function to get colors based on variant
  const getColors = () => {
    if (variant === 'interviewer') {
      return {
        tableBg: 'bg-blue-950/80',
        headerBg: 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50',
        headerText: 'text-blue-300',
        borderColor: 'border-blue-500/20',
        titleColor: 'text-blue-200',
        rowHover: 'hover:bg-blue-500/5'
      };
    }
    // Default admin colors
    return {
      tableBg: 'bg-[#161B22]/90',
      headerBg: 'bg-gradient-to-r from-purple-900/50 to-pink-900/50',
      headerText: 'text-purple-300',
      borderColor: 'border-purple-500/20',
      titleColor: 'text-white',
      rowHover: 'hover:bg-purple-500/5'
    };
  };

  const colors = getColors();
  
  // Then use colors.headerBg, colors.headerText, etc. in your JSX
  if (loading) {
    return (
      <div className={cn('table-glow rounded-xl overflow-hidden animate-pulse', className)}>
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-900/50 to-pink-900/50">
              <tr>
                {columns.map((_, index) => (
                  <th key={index} className="px-6 py-4 text-left">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/20">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="table-row-glow">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('table-glow rounded-xl overflow-hidden', colors.tableBg, className)}>
      {title && (
        <div className={cn("px-6 py-4", colors.borderColor)}>
          <h2 className={cn("text-lg font-semibold", colors.titleColor)}>{title} ({data.length})</h2>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(colors.headerBg)}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                    colors.headerText
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr 
                  key={item.id || index} 
                  className={cn(
                    "table-row-glow",
                    colors.rowHover,
                    onRowClick && "cursor-pointer hover:scale-[1.01] transition-transform"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render(item)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 