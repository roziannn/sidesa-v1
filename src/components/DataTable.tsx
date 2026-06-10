"use client";

import React from "react";
import { Eye, Pencil, Trash2, Database } from "lucide-react";

// Properti render sekarang mendukung argumen ketiga (index) secara opsional
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

  return (
    <div className="w-full bg-white border border-slate-200 shadow-sm overflow-hidden rounded-md">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-slate-300 font-bold text-[11px] uppercase">
              {columns.map((col, index) => (
                <th key={index} className="p-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {hasActions && <th className="p-4 text-center whitespace-nowrap">Aksi</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-700">
            {isLoading ? (
              [...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  ))}
                  {hasActions && (
                    <td className="p-4 flex justify-center gap-2">
                      <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                      <div className="h-7 w-7 bg-slate-200 rounded-lg"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Database className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    <span className="text-xs font-medium">Belum ada data tersedia</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={`transition-colors hover:bg-slate-50/80 ${rowIndex % 2 === 1 ? "bg-slate-50/40" : "bg-white"}`}>
                  {columns.map((col, colIndex) => {
                    const cellValue =
                      col.key in (row as object)
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (row as any)[col.key]
                        : undefined;

                    return (
                      <td key={colIndex} className="p-4 whitespace-nowrap">
                        {/* Menyalurkan rowIndex ke dalam fungsi render kolom */}
                        {col.render ? col.render(cellValue, row, rowIndex) : String(cellValue ?? "-")}
                      </td>
                    );
                  })}

                  {hasActions && (
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {onView && (
                          <button onClick={() => onView(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all" title="Lihat Detail">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {onEdit && (
                          <button onClick={() => onEdit(row)} className="p-1.5 text-[#15803d] hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all" title="Ubah Data">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {onDelete && (
                          <button onClick={() => onDelete(row)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all" title="Hapus Data">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </div>
  );
}
