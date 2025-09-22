"use client"

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export interface PaginatorProps {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number; // default 6
  siblingCount?: number; // how many pages to show on each side of current
  className?: string;
}

// Build page range with ellipsis
const getRange = (
  totalPages: number,
  current: number,
  siblingCount: number
): (number | "ellipsis")[] => {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2*siblings + 2 ellipsis

  if (totalNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, totalPages);

  const showLeftDots = left > 2;
  const showRightDots = right < totalPages - 1;

  const range: (number | "ellipsis")[] = [1];
  if (showLeftDots) range.push("ellipsis");
  for (let i = left; i <= right; i++) range.push(i);
  if (showRightDots) range.push("ellipsis");
  range.push(totalPages);
  return range;
};

const Paginator: React.FC<PaginatorProps> = ({
  page,
  totalItems,
  onPageChange,
  pageSize = 6,
  siblingCount = 1,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const canPrev = current > 1;
  const canNext = current < totalPages;

  if (totalPages <= 1) return null;

  const pages = getRange(totalPages, current, siblingCount);

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (canPrev) onPageChange(current - 1);
            }}
            aria-disabled={!canPrev}
            className={!canPrev ? "pointer-events-none opacity-50" : ""}
            href="#"
          />
        </PaginationItem>

        {pages.map((p, idx) => (
          <PaginationItem key={idx}>
            {p === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={p === current}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p as number);
                }}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (canNext) onPageChange(current + 1);
            }}
            aria-disabled={!canNext}
            className={!canNext ? "pointer-events-none opacity-50" : ""}
            href="#"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default Paginator;