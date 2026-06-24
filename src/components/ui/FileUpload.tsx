'use client';

import { ChangeEvent } from 'react';
import {
  Upload,
  File,
  X,
  FolderOpen,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export interface UploadedFile {
  file: File | null;
  preview?: string;
  isPdf: boolean;
}

interface FileUploadProps {
  label?: string;
  helperText?: string;

  files: UploadedFile[];
  onChange: (
    files: UploadedFile[]
  ) => void;

  maxFiles?: number;
  maxSizeMB?: number;

  accept?: string;

  allowFolder?: boolean;

  error?: string;
  className?: string;
}

export default function FileUpload({
  label,
  helperText,

  files,
  onChange,

  maxFiles = 3,
  maxSizeMB = 5,

  accept = 'image/*,application/pdf',

  allowFolder = false,

  error,
  className,
}: FileUploadProps) {
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles =
      Array.from(e.target.files);

    if (
      files.length +
        selectedFiles.length >
      maxFiles
    ) {
      alert(
        `Maksimal ${maxFiles} file`
      );

      return;
    }

    const validFiles: UploadedFile[] =
      [];

    for (const file of selectedFiles) {
      if (
        file.size >
        maxSizeMB *
          1024 *
          1024
      ) {
        alert(
          `${file.name} melebihi ${maxSizeMB} MB`
        );

        continue;
      }

      const isPdf =
        file.type ===
          'application/pdf' ||
        file.name
          .toLowerCase()
          .endsWith('.pdf');

      const preview = isPdf
        ? ''
        : URL.createObjectURL(
            file
          );

      validFiles.push({
        file,
        preview,
        isPdf,
      });
    }

    onChange([
      ...files,
      ...validFiles,
    ]);

    e.target.value = '';
  };

  const removeFile = (
    index: number
  ) => {
    const target =
      files[index];

    if (
      !target.isPdf &&
      target.preview
    ) {
      URL.revokeObjectURL(
        target.preview
      );
    }

    onChange(
      files.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <div
      className={cn(
        'space-y-2',
        className
      )}
    >
      {label && (
        <label className="block text-sm font-bold text-slate-700">
          {label}

          {helperText && (
            <span className="ml-1 text-[12px] font-medium lowercase text-slate-400">
              ({helperText})
            </span>
          )}
        </label>
      )}

      {files.length <
        maxFiles && (
        <div
          className="
            relative
            cursor-pointer
            rounded-xl
            border-2
            border-dashed
            border-slate-200

            bg-slate-50/50

            p-6

            text-center

            transition

            hover:border-emerald-500
            hover:bg-emerald-50/10

            group
          "
        >
          <input
            type="file"
            multiple
            accept={accept}
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-pointer
              opacity-0
            "
            onChange={
              handleFileChange
            }
            {...(allowFolder
              ? ({
                  webkitdirectory:
                    '',
                } as any)
              : {})}
          />

          <div className="flex flex-col items-center gap-2">
            {allowFolder ? (
              <FolderOpen className="h-8 w-8 text-slate-400 transition group-hover:text-emerald-600" />
            ) : (
              <Upload className="h-8 w-8 text-slate-400 transition group-hover:text-emerald-600" />
            )}

            <span className="text-xs font-bold text-slate-600">
              {allowFolder
                ? 'Klik untuk memilih folder'
                : 'Tarik berkas atau klik untuk mengunggah'}
            </span>

            <span className="text-[10px] text-slate-400">
              Maksimal{' '}
              {maxFiles}{' '}
              file •{' '}
              {maxSizeMB}
              MB
            </span>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="pt-2">
          {files.map((item, index) => (
            <div 
              key={index} 
              className="relative group w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {item.isPdf ? (
                <div className="flex h-48 w-full items-center justify-center bg-red-50 text-red-600">
                  <File className="h-16 w-16" />
                </div>
              ) : (
                <img
                  src={item.preview || ''}
                  alt="preview"
                  className="h-48 w-full object-cover"
                />
              )}
              
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-red-500"
              >
                <X className="h-4 w-4" />
              </button>

              {item.file && (
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}