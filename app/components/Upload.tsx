import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
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
      processFile(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      processFile(f);
    }
  };

  const processFile = (f: File) => {
    if (!isSignedIn) return;

    // 10MB size limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (f.size > MAX_SIZE) {
      // reject oversized files before doing anything else
      setError("File exceeds 10MB maximum size.");
      setFile(null);
      setProgress(0);
      // optionally invoke onComplete to surface an error path
      onComplete("");
      return;
    }

    // clear any previous error and any running timers
    setError(null);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setFile(f);
    setProgress(0);

    const reader = new FileReader();
    reader.onerror = () => {
      setFile(null);
      setProgress(0);
      setError("Failed to read file.");
    };
    reader.onload = () => {
      const base64 = reader.result as string;
      setProgress(0);
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            timeoutRef.current = window.setTimeout(() => {
              onComplete(base64);
            }, REDIRECT_DELAY_MS);
          }
          return Math.min(next, 100);
        });
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(f);
  };

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

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
            {error && <p className="error">{error}</p>}
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
