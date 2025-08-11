import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      setFiles(response.data);
    } catch (error) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/api/files/${fileId}`);
        setFiles(files.filter(file => file.id !== fileId));
      } catch (error) {
        setError('Failed to delete file');
      }
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/api/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading your files...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Welcome to Your Dashboard</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <Link to="/upload" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '30px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>📁 Upload Files</h3>
            <p style={{ color: '#666' }}>Add new files to your collection</p>
          </Link>
          <Link to="/search" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '30px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>🔍 Search Files</h3>
            <p style={{ color: '#666' }}>Find specific files quickly</p>
          </Link>
          <Link to="/profile" className="card" style={{ textDecoration: 'none', textAlign: 'center', padding: '30px' }}>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>👤 View Profile</h3>
            <p style={{ color: '#666' }}>Manage your account settings</p>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Files</h2>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No files uploaded yet.</p>
            <Link to="/upload" className="btn" style={{ marginTop: '20px', display: 'inline-block', width: 'auto' }}>
              Upload Your First File
            </Link>
          </div>
        ) : (
          <ul className="file-list">
            {files.slice(0, 5).map(file => (
              <li key={file.id} className="file-item">
                <div className="file-info">
                  <div className="file-name">{file.original_name}</div>
                  <div className="file-meta">
                    Size: {formatFileSize(file.file_size)} | 
                    Uploaded: {formatDate(file.upload_date)}
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    onClick={() => handleDownload(file.filename)}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px' }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="btn btn-danger"
                    style={{ width: 'auto', padding: '8px 16px' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {files.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/search" className="btn btn-secondary">
              View All Files
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
