
import React, { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, FileUp } from "lucide-react";

const ResumeUpload = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError("");

    if (!file) return;

    const isValidExtension = /\.(pdf|docx)$/i.test(file.name);

    if (!isValidExtension) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const removeFile = (event) => {
    event.stopPropagation();

    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onFileSelect(null);
  };

  return (
    <div className="resume-upload-section">

      <div className="upload-heading">
        <div>
          <h2>Upload Your Resume</h2>
          <p>Let's discover how strong your resume really is.</p>
        </div>

        <div className="upload-heading-icon">
          <FileUp size={25} />
        </div>
      </div>

      <div
        className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.docx"
          hidden
          onChange={(event) => {
            handleFile(event.target.files[0]);
            event.target.value = "";
          }}
        />

        <div className="upload-icon">
          <Upload size={30} />
        </div>

        <h3>Drop your resume here</h3>

        <p>
          or <span>browse files</span> from your computer
        </p>

        <div className="upload-formats">
          <span>PDF</span>
          <span>DOCX</span>
          <span>Maximum 5 MB</span>
        </div>
      </div>

      {error && <div className="upload-error">{error}</div>}

      {selectedFile && (
        <div className="selected-file-card">
          <div className="file-details">
            <div className="file-icon">
              <FileText size={23} />
            </div>

            <div>
              <h4>{selectedFile.name}</h4>
              <p>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="file-actions">
            <CheckCircle size={21} className="file-success" />

            <button
              type="button"
              className="remove-file-btn"
              onClick={removeFile}
              aria-label="Remove selected file"
            >
              <X size={19} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeUpload;
