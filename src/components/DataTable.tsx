"use client";

import React, { useState } from "react";
import {
  Eye,
  Trash2,
  Database,
  ChevronLeft,
  ChevronRight,
  Edit,
  Archive,
} from "lucide-react";
import Button from "./ui/Button";
import Skeleton from "./loading/PageSkeleton";

export interface Column<T> {
  key: keyof T | string;
  label: React.ReactNode;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onArchive?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onArchive,
}: DataTableProps<T>) {
  const hasActions = !!onEdit || !!onDelete || !!onView || !!onArchive;
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = data.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage,
  );

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="w-full overflow-hidden border border-slate-200 shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-slate-600 text-xs font-semibold uppercase text-slate-200">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left whitespace-nowrap first: last:"
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className=" px-6 py-3 text-center whitespace-nowrap">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              [...Array(rowsPerPage)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                      <Skeleton
                        className={
                          colIndex === 0
                            ? "h-3 w-10"
                            : colIndex === columns.length - 1
                              ? "h-3 w-24"
                              : "h-3 w-32"
                        }
                      />
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-7 w-7 " />
                        <Skeleton className="h-7 w-7 " />
                        <Skeleton className="h-7 w-7 " />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="p-10 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="h-8 w-8 text-slate-200" />
                    <span className="text-xs font-medium">
                      Belum ada data tersedia
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="transition-colors hover:bg-slate-50">
                  {columns.map((col, colIndex) => {
                    const rowRecord = row as Record<string, unknown>;
                    const cellValue =
                      col.key in rowRecord
                        ? rowRecord[col.key as string]
                        : undefined;
                    return (
                      <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                        {col.render
                          ? col.render(
                              cellValue,
                              row,
                              (safeCurrentPage - 1) * rowsPerPage + rowIndex,
                            )
                          : typeof cellValue === "string"
                            ? capitalize(cellValue)
                            : String(cellValue ?? "-")}
                      </td>
                    );
                  })}
                  {hasActions && (
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {(() => {
                          const status = (row as Record<string, unknown>).status;
                          const isArchived = status === "archive";

                          return (
                            <>
                        {onView && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => onView(row)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onEdit(row)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {onArchive && (
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-7 w-7 border-amber-200 ${
                              isArchived
                                ? "bg-blue-50 text-blue-600"
                                : "text-amber-600"
                            } hover:bg-amber-50`}
                            onClick={() => onArchive(row)}
                          >
                            {isArchived ? (
                              <Database className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
        <span className="text-xs text-slate-500">
          {isLoading
            ? "Memuat data..."
            : data.length > 0
              ? `Menampilkan ${(safeCurrentPage - 1) * rowsPerPage + 1} - ${Math.min(safeCurrentPage * rowsPerPage, data.length)} dari ${data.length} data`
              : "Tidak ada data"}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className=" p-1.5 hover:bg-slate-200 disabled:opacity-50"
            disabled={isLoading || safeCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs font-semibold">
            {safeCurrentPage} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className=" p-1.5 hover:bg-slate-200 disabled:opacity-50"
            disabled={isLoading || safeCurrentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
