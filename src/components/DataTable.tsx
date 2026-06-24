"use client";

import React, { useState } from "react";
import { Eye, Trash2, Database, ChevronLeft, ChevronRight, Edit, Archive } from "lucide-react";
import Button from "./ui/Button";

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
  onArchive 
}: DataTableProps<T>) {
  
  const hasActions = !!onEdit || !!onDelete || !!onView || !!onArchive;
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="w-full shadow-sm overflow-hidden rounded-lg border border-slate-200">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
          <tr className="bg-slate-900 text-slate-200 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-700 shadow-sm">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg"
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-3 text-center whitespace-nowrap rounded-tr-lg">
                Aksi
              </th>
            )}
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
                      <div className="flex items-center justify-center gap-1.5">
                        {onView && (
                          <Button variant="outline" size="icon" className="h-7 w-7 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => onView(row)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="outline" size="icon" className="h-7 w-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => onEdit(row)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onArchive && (
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-7 w-7 border-amber-200 ${(row as any)?.status === 'archive' ? 'text-blue-600 bg-blue-50' : 'text-amber-600'} hover:bg-amber-50`}
                        onClick={() => onArchive(row)}
                        >
                          {(row as any)?.status === 'archive' ? (
                              <Database className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" /> 
                            )}
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="outline" size="icon" className="h-7 w-7 border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(row)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
        <span className="text-xs text-slate-500">
          {data.length > 0
            ? `Menampilkan ${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(currentPage * rowsPerPage, data.length)} dari ${data.length} data`
            : 'Tidak ada data'}
        </span>

        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 rounded hover:bg-slate-200" disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2">{currentPage} / {Math.max(1, totalPages)}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 rounded hover:bg-slate-200" disabled={currentPage === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}