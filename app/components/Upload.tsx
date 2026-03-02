import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";

import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from "../../lib/constants";

interface UploadProps {
  /** called when the file has finished uploading, receives the base64 string */
  onComplete?: (base64Data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onComplete = () => {} }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isSignedIn } = useOutletContext<AuthContext>();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    if (isSignedIn) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      processFile(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      processFile(f);
    }
  };

  const processFile = (f: File) => {
    if (!isSignedIn) return;
    setFile(f);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProgress(0);
      const id = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            clearInterval(id);
            setTimeout(() => {
              onComplete(base64);
            }, REDIRECT_DELAY_MS);
          }
          return Math.min(next, 100);
        });
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className={`upload ${isDragging ? "dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {!file ? (
        <div className={`dropzone ${isDragging ? "is-dragging" : ""}`}>
          <input type="file" id="fileInput" className="drop-input" accept=".jpg, .jpeg, .png" disabled={!isSignedIn} onChange={handleFileChange} />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon className="icon" size={20} />
            </div>
            <p>{isSignedIn ? "Click to upload or drag and drop your floor plan here" : "Sign in or sign up to upload"}</p>
            <p className="help">Maximum file size is 10MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">{progress === 100 ? <CheckCircle2 className="check" /> : <ImageIcon className="image" />}</div>
            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">{progress < 100 ? "Analyzing Floor Plan ..." : "Redirecting ..."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
