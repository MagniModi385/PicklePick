import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function CompleteProfilePage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: '',
    skill_level: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formStyle = {
    maxWidth: 400,
    margin: '40px auto',
    padding: 30,
    border: '1px solid #ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 20,
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 16,
  };

  const buttonStyle = {
    width: '48%',
    padding: '12px 0',
    marginTop: 10,
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  };

  const primaryBtnStyle = {
    ...buttonStyle,
    backgroundColor: '#4caf50',
    color: 'white',
  };

  const skipBtnStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    color: '#333',
  };

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await getToken({ template: 'standard' });

      const res = await fetch('http://127.0.0.1:8000/api/profile/complete/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        navigate('/'); // Redirect to home after profile completion
      } else {
        const data = await res.json();
        setError(data.error || 'Unknown error occurred');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }
async function onSkip() {
  setError(null);
  setLoading(true);
  try {
    const token = await getToken({ template: 'standard' });
    // Send blank/default profile to backend
    const res = await fetch('http://127.0.0.1:8000/api/profile/complete/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: "",
        location: "",
        skill_level: ""
      }),
    });

    if (res.ok) {
      navigate('/'); // success: show homepage
    } else {
      const data = await res.json();
      setError(data.error || 'Unknown error');
    }
  } catch {
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

  return (
    <form style={formStyle} onSubmit={onSubmit} noValidate>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#222' }}>
        Complete Your Profile
      </h2>
      <label style={labelStyle} htmlFor="location">
        Location
      </label>
      <input
        id="location"
        name="location"
        value={form.location}
        onChange={onChange}
        required
        style={inputStyle}
        placeholder="Enter location"
        disabled={loading}
      />

      <label style={labelStyle} htmlFor="skill_level">
        Skill Level
      </label>
      <select
        id="skill_level"
        name="skill_level"
        value={form.skill_level}
        onChange={onChange}
        required
        style={inputStyle}
        disabled={loading}
      >
        <option value="" disabled>
          Select your skill level
        </option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
        <option value="Advanced">Competetive</option>
      </select>

      {error && (
        <p style={{ color: 'red', marginBottom: 12, fontWeight: 'bold' }}>{error}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          type="submit"
          style={primaryBtnStyle}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
        <button
          type="button"
          style={skipBtnStyle}
          onClick={onSkip}
          disabled={loading}
        >
          Skip
        </button>
      </div>
    </form>
  );
}
