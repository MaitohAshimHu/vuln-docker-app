import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfileData(response.data);
    } catch (error) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">User Profile</h1>
        </div>
        
        <div className="profile-info">
          <div className="profile-field">
            <div className="profile-label">Username</div>
            <div className="profile-value">{profileData?.username}</div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">Email</div>
            <div className="profile-value">{profileData?.email}</div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">User ID</div>
            <div className="profile-value">{profileData?.id}</div>
          </div>
          
          <div className="profile-field">
            <div className="profile-label">Member Since</div>
            <div className="profile-value">{formatDate(profileData?.created_at)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Account Information</h2>
        </div>
        
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p><strong>Welcome to File Manager!</strong></p>
          <p>Your account provides you with:</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Secure file storage and management</li>
            <li>Easy file upload with drag & drop support</li>
            <li>Fast file search and organization</li>
            <li>File download and sharing capabilities</li>
            <li>User-friendly interface for all devices</li>
          </ul>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontSize: '14px' }}>
              <strong>Note:</strong> Your files are stored securely and are only accessible to you. 
              Make sure to keep your login credentials safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
