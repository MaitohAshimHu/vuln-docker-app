import React, { useState, useRef } from 'react';
import axios from 'axios';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setError('');
    setMessage('');
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setMessage(`Successfully uploaded ${files.length} file(s)!`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload Files</h1>
        </div>
        
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div
          className={`upload-area ${dragActive ? 'dragover' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            style={{ display: 'none' }}
            accept="*/*"
          />
          
          <div style={{ marginBottom: '20px' }}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ color: dragActive ? '#007bff' : '#666' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          
          <h3 style={{ marginBottom: '10px', color: '#333' }}>
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </h3>
          
          <p style={{ color: '#666', marginBottom: '20px' }}>
            or click the button below to select files
          </p>
          
          <button
            className="btn"
            onClick={onButtonClick}
            disabled={uploading}
            style={{ width: 'auto', padding: '12px 24px' }}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>

        <div style={{ textAlign: 'center', color: '#666' }}>
          <p><strong>Supported formats:</strong> All file types</p>
          <p><strong>Maximum file size:</strong> 10MB per file</p>
          <p><strong>Multiple files:</strong> Yes, you can upload multiple files at once</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
