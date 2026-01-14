"use client";

import React, { useRef, useState } from "react";
import styles from "./FileUpload.module.scss";

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  className?: string;
  maxFiles?: number;
  maxSize?: number; // в МБ
  acceptedTypes?: string[];
}

export function FileUpload({
  files,
  onChange,
  className,
  maxFiles = 5,
  maxSize = 10, // 10 МБ
  acceptedTypes = ["image/*", "video/*"],
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Проверка размера файла
      if (file.size > maxSize * 1024 * 1024) {
        alert(
          `Файл "${file.name}" слишком большой. Максимальный размер: ${maxSize} МБ`
        );
        continue;
      }

      // Проверка типа файла
      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const baseType = type.replace("/*", "");
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        alert(
          `Файл "${
            file.name
          }" имеет неподдерживаемый тип. Разрешены: ${acceptedTypes.join(", ")}`
        );
        continue;
      }

      validFiles.push(file);
    }

    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
    onChange(updatedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ", "ГБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`${styles.fileUpload} ${className || ""}`}>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className={styles.hiddenInput}
        />
        <div className={styles.uploadIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className={styles.uploadText}>Загрузить файлы</span>
        <span className={styles.uploadHint}>
          Перетащите файлы сюда или нажмите для выбора
        </span>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className={styles.removeButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
