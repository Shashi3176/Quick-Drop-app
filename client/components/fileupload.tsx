"use client";
import { FileUpload } from "../components/ui/file-upload";

type FileUploadFinalProps = {
  onFileSelect?: (file: File | null) => void;
};

export function FileUploadFinal({ onFileSelect }: FileUploadFinalProps) {
  const handleFileUpload = (files: File[]) => {
    // Store only serializable metadata. Storing full File objects in localStorage is not possible.
    const metadata = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
    }));
    localStorage.setItem("file", JSON.stringify(metadata));
    // Call parent callback with the first file (or null if none)
    onFileSelect?.(files && files.length > 0 ? files[0] : null);
  };

  return (
    <div className="w-full max-w-4xl  mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}
