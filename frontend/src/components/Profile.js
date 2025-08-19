import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const Profile = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    skill_level: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize form with current Clerk data
  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        skill_level: '', // This will be empty initially
        location: ''     // This will be empty initially
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch('http://127.0.0.1:8000/api/profile/update/', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to update profile'}`);
      }
    } catch (err) {
      setMessage('Network error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Update Profile</h2>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderColor: message.includes('Error') ? '#f5c6cb' : '#c3e6cb'
        }}>
          {message}
        </div>
      )}

      <div style={styles.profileCard}>
      <div style={styles.avatarSection}>
  <div style={styles.avatar}>
    {profile.first_name ? profile.first_name.toUpperCase() : (user?.firstName ? user.firstName.toUpperCase() : 'U')}
  </div>
  <h3 style={styles.userName}>
    {user?.fullName || 'User'}
  </h3>
  <p style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</p>
  <p style={styles.subtitle}>Update your profile information below</p>
    </div>


        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter your first name (optional)"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter your last name (optional)"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Skill Level</label>
              <select
                name="skill_level"
                value={profile.skill_level}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select skill level (optional)</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Competitive">Competitive</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Enter your city/location (optional)"
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.saveBtn}
            disabled={saving}
          >
            {saving ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  message: {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  avatarSection: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  userEmail: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
  form: {
    width: '100%',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '20px',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  currentValues: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  valueItem: {
    padding: '8px 0',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f0f0f0',
  },
};

export default Profile;
