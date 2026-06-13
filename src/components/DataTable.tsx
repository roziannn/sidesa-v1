"use client";

import React, { useState } from "react";
import { Eye, Pencil, Trash2, Database, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";

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
}

export default function DataTable<T>({ columns, data, isLoading = false, onEdit, onDelete, onView }: DataTableProps<T>) {
  const hasActions = !!onEdit || !!onDelete || !!onView;
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Logika Slicing Data
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="w-full shadow-sm overflow-hidden rounded-lg">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-slate-300 font-bold text-[10px] uppercase tracking-wider">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-4 whitespace-nowrap">{col.label}</th>
              ))}
              {hasActions && <th className="px-4 py-4 text-center whitespace-nowrap">Aksi</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              [...Array(rowsPerPage)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, colIndex) => <td key={colIndex} className="px-4 py-3.5"><div className="h-3 bg-slate-100 rounded w-3/4"></div></td>)}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="p-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="w-8 h-8 text-slate-200" />
                    <span className="text-xs font-medium">Belum ada data tersedia</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, colIndex) => {
                    const cellValue = col.key in (row as object) ? (row as any)[col.key] : undefined;
                    return (
                      <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                       {col.render ? 
                          col.render(cellValue, row, (currentPage - 1) * rowsPerPage + rowIndex) : 
                          (typeof cellValue === 'string' ? capitalize(cellValue) : String(cellValue ?? "-"))
                        }
                      </td>
                    );
                  })}
                  {hasActions && (
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {onView && <button onClick={() => onView(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"><Eye className="w-3.5 h-3.5" /></button>}
                        {onEdit && <button onClick={() => onEdit(row)} className="p-1 text-[#15803d] hover:bg-emerald-50 rounded transition-all"><Edit2 className="w-3.5 h-3.5" /></button>}
                        {onDelete && <button onClick={() => onDelete(row)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
      <span className="text-xs text-slate-500">
        {data.length > 0
          ? `Menampilkan ${
              (currentPage - 1) * rowsPerPage + 1
            } - ${Math.min(
              currentPage * rowsPerPage,
              data.length
            )} dari ${data.length} data`
          : 'Tidak ada data'}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage((prev) => prev - 1);
            }
          }}
          className="p-1.5 rounded hover:bg-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold px-2">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage((prev) => prev + 1);
            }
          }}
          className="p-1.5 rounded hover:bg-slate-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
    </div>
  );
}