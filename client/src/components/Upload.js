import React, { useState, useRef } from 'react';
import axios from 'axios';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  // File upload vulnerability flag
  const fileUploadFlag = 'ninja{file_upload_vulnerability_exploited_}';

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

        {/* File Upload Vulnerability Testing Section */}
        <div className="vulnerability-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
          <h3>⚠️ File Upload Vulnerability Testing</h3>
          <p style={{ color: '#856404', marginBottom: '15px' }}>
            <strong>Warning:</strong> This application is vulnerable to file upload attacks. 
            You can upload and execute malicious files including executables, scripts, and other dangerous file types.
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Test Files to Upload:</h4>
            <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
              <li><strong>Executable files:</strong> .exe, .bat, .sh, .py files</li>
              <li><strong>Script files:</strong> .js, .php, .rb files</li>
              <li><strong>Shell scripts:</strong> .sh, .bash, .zsh files</li>
              <li><strong>Any file type:</strong> No restrictions enforced</li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>How to Exploit:</h4>
            <ol style={{ textAlign: 'left', marginLeft: '20px' }}>
              <li>Upload a malicious file (e.g., a shell script with the flag)</li>
              <li>Use the <code>/api/process-file/:filename</code> endpoint to execute it</li>
              <li>Extract the flag: <code>{fileUploadFlag}</code></li>
            </ol>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', fontFamily: 'monospace' }}>
            <strong>Example malicious file content:</strong><br/>
            <code>#!/bin/bash<br/>
            echo "{fileUploadFlag}"<br/>
            whoami<br/>
            pwd</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
