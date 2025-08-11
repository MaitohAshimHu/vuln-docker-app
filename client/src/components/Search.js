import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hidden XSS flag - accessible via XSS payloads
  const xssFlag = 'ninja{xss_vulnerability_exploited_}';

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const response = await axios.get('/api/files');
      setAllFiles(response.data);
    } catch (error) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      setError('Search failed');
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/api/files/${fileId}`);
        // Remove from both search results and all files
        setSearchResults(searchResults.filter(file => file.id !== fileId));
        setAllFiles(allFiles.filter(file => file.id !== fileId));
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

  const testCommandInjection = async () => {
    const commandInput = document.getElementById('command-input');
    const commandOutput = document.getElementById('command-output');
    const command = commandInput.value.trim();
    
    if (!command) {
      commandOutput.textContent = 'Please enter a command to execute.';
      return;
    }

    try {
      commandOutput.textContent = 'Executing command...';
      const response = await axios.get(`/api/system-info?command=${encodeURIComponent(command)}`);
      
      if (response.data.output) {
        commandOutput.textContent = `Command: ${command}\nOutput:\n${response.data.output}`;
      } else {
        commandOutput.textContent = `Command: ${command}\nNo output (command may have executed silently)`;
      }
    } catch (error) {
      commandOutput.textContent = `Error: ${error.response?.data?.error || error.message}`;
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

  const displayFiles = searchQuery.trim() ? searchResults : allFiles;

  if (loading) {
    return <div className="loading">Loading your files...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Search Files</h1>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* XSS VULNERABILITY: Search query is rendered directly without sanitization */}
        {/* This allows XSS attacks - DO NOT USE IN PRODUCTION! */}
        {searchQuery.trim() && (
          <div className="search-results-header">
            <h3>Search Results for: <span dangerouslySetInnerHTML={{ __html: searchQuery }}></span></h3>
            <p>Found {searchResults.length} result(s)</p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Hidden XSS flag div - accessible via XSS payloads */}
        <div id="xss-flag" style={{ display: 'none' }} data-flag={xssFlag}></div>

        {/* Command Injection Testing Section */}
        <div className="vulnerability-section">
          <h3>🔓 Command Injection Testing</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Test command injection vulnerability (requires authentication)
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Enter command (e.g., whoami, ls, cat /etc/passwd)"
              style={{ flex: 1 }}
              id="command-input"
            />
            <button
              className="btn btn-secondary"
              onClick={testCommandInjection}
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              Execute
            </button>
          </div>
          <div id="command-output" style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '5px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            minHeight: '50px'
          }}>
            Command output will appear here...
          </div>
        </div>

        <div style={{ marginBottom: '20px', color: '#666' }}>
          {searchQuery.trim() ? (
            <p>
              Found {searchResults.length} result(s) for "{searchQuery}"
              {searchResults.length !== allFiles.length && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px', width: 'auto', padding: '8px 16px' }}
                >
                  Clear Search
                </button>
              )}
            </p>
          ) : (
            <p>Showing all {allFiles.length} files</p>
          )}
        </div>

        {displayFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {searchQuery.trim() ? (
              <div>
                <p>No files found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary"
                  style={{ marginTop: '20px' }}
                >
                  View All Files
                </button>
              </div>
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </div>
        ) : (
          <ul className="file-list">
            {displayFiles.map(file => (
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
      </div>
    </div>
  );
};

export default Search;
