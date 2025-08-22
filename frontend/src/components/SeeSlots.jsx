import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SeeSlots = () => {
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [slotsData, setSlotsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get venue data from navigation state
  const venueData = location.state || {};
  const { venueUrl, venueName, venueId } = venueData;
  useEffect(() => {

    if (venueUrl) {
      handleScrapeSlots();
    }
  }, [venueUrl]);

  const handleScrapeSlots = async () => {
    if (!venueUrl) {
      setError('No venue URL provided');
      return;
    }

    setLoading(true);
    setError('');
    setSlotsData(null);

    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch('http://127.0.0.1:8000/api/scrape-slots/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue_url: venueUrl,
          venue_name: venueName || 'Selected Venue'
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSlotsData(data);
      } else {
        setError(data.error || 'Error scraping slots');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If no venue data, show error and back button
  if (!venueUrl && !location.state) {
    return (
      <div style={styles.container}>
        <div style={styles.errorPage}>
          <h2 style={styles.errorTitle}>No Venue Selected</h2>
          <p style={styles.errorText}>
            Please select a venue from the venues page to check slots.
          </p>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/')}
          >
            🏓 Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with venue info */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            style={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1 style={styles.title}>Court Slots for {venueName} 🏓</h1>
          <p style={styles.subtitle}>
            Real-time availability checker (running in background)
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingSection}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner}></div>
            <h3 style={styles.loadingTitle}>Checking Available Slots...</h3>
            <p style={styles.loadingText}>
              Scraping court data from {venueName}.Please Wait a few moments.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={styles.errorSection}>
          <div style={styles.errorCard}>
            <h3 style={styles.errorTitle}>❌ Error</h3>
            <p style={styles.errorText}>{error}</p>
            <button 
              style={styles.retryButton}
              onClick={handleScrapeSlots}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {slotsData && (
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              📊 Available Slots
            </h2>
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{slotsData.total_courts}</span>
                <span style={styles.statLabel}>Courts</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>
                  {slotsData.courts?.reduce((total, court) => total + court.available_slots, 0) || 0}
                </span>
                <span style={styles.statLabel}>Available</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>
                  {slotsData.courts?.reduce((total, court) => total + court.total_slots, 0) || 0}
                </span>
                <span style={styles.statLabel}>Total Slots</span>
              </div>
            </div>
            
            <button 
              style={styles.refreshButton}
              onClick={handleScrapeSlots}
              disabled={loading}
            >
              🔄 Refresh Slots
            </button>
          </div>

          {/* Courts Display */}
          <div style={styles.courtsContainer}>
            {slotsData.courts?.map((court, index) => (
              <CourtSlotsTable key={index} court={court} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Court table component (same as before)
const CourtSlotsTable = ({ court }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Group slots by date
  const slotsByDate = court.slots?.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {}) || {};

  const dates = Object.keys(slotsByDate).sort();

  return (
    <div style={styles.courtCard}>
      <div style={styles.courtHeader}>
        <h3 style={styles.courtName}>🏟️ {court.court_name}</h3>
        <div style={styles.courtStats}>
          <span style={styles.availableCount}>
            ✅ {court.available_slots} Available
          </span>
          <span style={styles.totalCount}>
            📊 {court.total_slots} Total
          </span>
        </div>
      </div>

      {court.slots?.length > 0 ? (
        <>
          {/* Slots by Date */}
          {dates.slice(0, showAll ? dates.length : 2).map(date => (
            <div key={date} style={styles.dateSection}>
              <h4 style={styles.dateHeader}>📅 Date {date}</h4>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Time</th>
                      <th style={styles.tableHeader}>Price</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slotsByDate[date].map((slot, slotIndex) => (
                      <tr 
                        key={slotIndex}
                        style={{
                          ...styles.tableRow,
                          backgroundColor: slot.is_available ? '#e8f5e9' : '#ffebee'
                        }}
                      >
                        <td style={styles.tableCell}>{slot.time}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.price}>{slot.price || 'N/A'}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: slot.is_available ? '#4caf50' : '#f44336'
                          }}>
                            {slot.is_available ? '✅ Available' : '❌ Unavailable'}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.availability}>{slot.availability}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {dates.length > 2 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={styles.toggleButton}
            >
              {showAll ? '🔼 Show Less' : `🔽 Show All ${dates.length} Dates`}
            </button>
          )}
        </>
      ) : (
        <div style={styles.noSlots}>
          <span style={styles.noSlotsIcon}>😔</span>
          <span>No slots found for this court</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%)',
    padding: '20px',
  },

  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    maxWidth: '1000px',
    margin: '0 auto 30px auto',
    position: 'relative',
  },

  headerContent: {
    textAlign: 'center',
  },

  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: '#f1f8e9',
    border: '1px solid #e8f5e8',
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#2e7d32',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },

  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '16px',
    color: '#5a7c5a',
    margin: 0,
  },

  loadingSection: {
    display: 'flex',
    justifyContent: 'center',
  },

  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '500px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid #e8f5e8',
    borderTop: '4px solid #2e7d32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px auto',
  },

  loadingTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '12px',
  },

  loadingText: {
    fontSize: '16px',
    color: '#5a7c5a',
    margin: 0,
  },

  errorPage: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '50px auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  errorSection: {
    display: 'flex',
    justifyContent: 'center',
  },

  errorCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: '1px solid #ffcdd2',
  },

  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: '16px',
  },

  errorText: {
    fontSize: '16px',
    color: '#5a7c5a',
    marginBottom: '24px',
    lineHeight: '1.6',
  },

  backButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  retryButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  resultsSection: {
    maxWidth: '1400px',
    margin: '0 auto',
  },

  resultsHeader: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    textAlign: 'center',
  },

  resultsTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '20px',
  },

  statItem: {
    textAlign: 'center',
  },

  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: '4px',
  },

  statLabel: {
    fontSize: '14px',
    color: '#5a7c5a',
    fontWeight: '500',
  },

  refreshButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  courtsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  courtCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e8f5e8',
  },

  courtHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
  },

  courtName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    margin: 0,
  },

  courtStats: {
    display: 'flex',
    gap: '16px',
  },

  availableCount: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: '14px',
  },

  totalCount: {
    color: '#5a7c5a',
    fontWeight: '600',
    fontSize: '14px',
  },

  dateSection: {
    marginBottom: '24px',
  },

  dateHeader: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '12px',
    padding: '8px 16px',
    backgroundColor: '#f1f8e9',
    borderRadius: '8px',
    border: '1px solid #e8f5e8',
  },

  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e8f5e8',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },

  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
  },

  tableHeader: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#2d4a2f',
    borderBottom: '2px solid #e8f5e8',
  },

  tableRow: {
    transition: 'background-color 0.2s ease',
  },

  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle',
  },

  price: {
    fontWeight: '600',
    color: '#2e7d32',
    fontSize: '16px',
  },

  statusBadge: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
  },

  availability: {
    fontSize: '14px',
    color: '#5a7c5a',
  },

  toggleButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f1f8e9',
    border: '1px solid #e8f5e8',
    borderRadius: '8px',
    color: '#2e7d32',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px',
    transition: 'all 0.2s ease',
  },

  noSlots: {
    textAlign: 'center',
    padding: '40px',
    color: '#5a7c5a',
    fontSize: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  noSlotsIcon: {
    fontSize: '32px',
  },
};

// Add spinner animation
const addSpinnerAnimation = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .stats-row {
        flex-direction: column !important;
        gap: 16px !important;
      }
      
      .court-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  addSpinnerAnimation();
}

export default SeeSlots;
