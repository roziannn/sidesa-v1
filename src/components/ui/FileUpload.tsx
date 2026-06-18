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
  file: File;
  preview: string;
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

      {files.length >
        0 && (
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
          {files.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="
                  relative

                  flex
                  items-center
                  gap-3

                  rounded-xl
                  border
                  border-slate-200

                  bg-white

                  p-3

                  shadow-sm
                "
              >
                {item.isPdf ? (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <File className="h-6 w-6" />
                  </div>
                ) : (
                  <img
                    src={
                      item.preview
                    }
                    alt="preview"
                    className="
                      h-12
                      w-12
                      shrink-0
                      rounded-lg
                      border
                      object-cover
                    "
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {
                      item.file
                        .name
                    }
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {(
                      item.file
                        .size /
                      1024 /
                      1024
                    ).toFixed(
                      2
                    )}{' '}
                    MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeFile(
                      index
                    )
                  }
                  className="
                    rounded-full
                    p-1

                    text-slate-400

                    transition

                    hover:bg-slate-100
                    hover:text-red-500
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          )}
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