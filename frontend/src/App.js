import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import ChatWindow from './components/ChatWindow';

function App() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVenues() {
      if (!isSignedIn) {
        setError('User is not signed in');
        setVenues([]);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const token = await getToken({ template: 'backend' });

        if (!token) {
          throw new Error('Failed to retrieve auth token');
        }

        const response = await fetch('http://127.0.0.1:8000/api/venues/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVenues(data);
          setFilteredVenues(data); // Show all venues by default
        } else {
          setError('Failed to load venues');
        }
      } catch (err) {
        setError('Error loading venues');
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, [isSignedIn, getToken]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      // Show all venues when search is empty
      setFilteredVenues(venues);
    } else {
      // Filter venues by name (case-insensitive)
      const filtered = venues.filter(venue =>
        venue.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVenues(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredVenues(venues);
  };

  if (loading) return <div style={styles.loading}>Loading venues...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.fullScreenContainer}>
      <div style={styles.contentContainer}>
        {/* Header Section with Search */}
        <div style={styles.header}>
          <h1 style={styles.title}>Find people to play here. At PicklePick.</h1>
          <p style={styles.welcome}>Welcome {user?.fullName || user?.firstName || 'Player'}!</p>
          
          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="#666"
                style={styles.searchIcon}
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              
              <input
                type="text"
                placeholder="Search venues by name..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchInput}
              />
              
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={styles.clearButton}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#666">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results Counter */}
          <div style={styles.resultsInfo}>
            {searchTerm ? (
              <p style={styles.resultsText}>
                {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found 
                {filteredVenues.length > 0 && (
                  <span> for "<strong>{searchTerm}</strong>"</span>
                )}
              </p>
            ) : (
              <p style={styles.resultsText}>
                Showing all <strong>{venues.length}</strong> venue{venues.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Venues Container */}
        <div style={styles.venuesContainer}>
          {filteredVenues.length === 0 && venues.length > 0 ? (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>🔍</div>
              <h3 style={styles.noResultsTitle}>No venues found</h3>
              <p style={styles.noResultsText}>
                Try searching with a different term or{' '}
                <button 
                  onClick={clearSearch}
                  style={styles.showAllButton}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#0056b3';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#007bff';
                  }}
                >
                  show all venues
                </button>
              </p>
            </div>
          ) : (
            filteredVenues.map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const VenueCard = ({ venue }) => {
  const { getToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch(`http://127.0.0.1:8000/api/posts/?venue_id=${venue._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  return (
    <div style={styles.venueCard}>
      <h2 style={styles.venueName}>{venue.name}</h2>
      
      <div style={styles.venueContent}>
        <div style={styles.imageContainer}>
          <img 
            src={venue.image_url} 
            alt={venue.name}
            style={styles.venueImage}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=Venue+Image';
            }}
          />
        </div>
        
        <div style={styles.venueInfo}>
          <p style={styles.location}>{venue.location}</p>
          <p style={styles.description}>{venue.description}</p>
          
          <div style={styles.buttonContainer}>
            <button 
              style={styles.createPostBtn}
              onClick={() => setShowCreatePost(true)}
            >
              Create Post
            </button>
            <button style={styles.seeSlotsBtn}>See Slots</button>
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal 
          venue={venue} 
          onClose={() => setShowCreatePost(false)}
          onPostCreated={() => {
            setShowCreatePost(false);
            fetchPosts(); // Refresh posts
          }}
        />
      )}
      
      {/* Real Posts Section */}
      <div style={styles.postsSection}>
        {postsLoading ? (
          <div style={styles.postsLoading}>Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.slice(0, 4).map((post) => ( // Show max 4 posts
            <RealPostCard 
              key={post._id} 
              post={post} 
              onInterestToggled={fetchPosts} 
            />
          ))
        ) : (
          <div style={styles.noPosts}>No posts yet. Be the first to create one!</div>
        )}
      </div>
    </div>
  );
};

const RealPostCard = ({ post, onInterestToggled }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const currentUserId = user?.id || user?.user_id;
  const isCreator = post.created_by === currentUserId;
  const isInterested = post.interested_users?.includes(currentUserId);

  const [loading, setLoading] = useState(false);
  const [interestedState, setInterestedState] = useState(isInterested);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setInterestedState(isInterested);
  }, [isInterested]);

  const handleInterest = async () => {
    if (isCreator) return;
    setLoading(true);
    try {
      const token = await getToken({ template: "backend" });
      const response = await fetch(
        `http://127.0.0.1:8000/api/posts/${post._id}/interest/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setInterestedState(!interestedState);
        onInterestToggled && onInterestToggled();
      } else {
        const error = await response.json();
        alert('Error updating interest: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      alert("Error updating interest: " + err.message);
    }
    setLoading(false);
  };

  const handleSendMessage = () => {
    setShowChat(true);
  };

  return (
    <>
      <div 
        style={{
          ...styles.postCardPro,
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0px)',
          boxShadow: isHovered 
            ? '0 12px 24px rgba(46, 125, 50, 0.25)' 
            : '0 4px 12px rgba(46, 125, 50, 0.15)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header Badge */}
        <div style={styles.headerBadge}>
          <div style={styles.avatarIcon}>
            {post.created_by_name ? post.created_by_name[0].toUpperCase() : 'A'}
          </div>
          <div style={styles.headerInfo}>
            <div style={styles.postedByText}>Posted by</div>
            <div style={styles.authorName}>{post.created_by_name || "Anonymous"}</div>
          </div>
          <div style={styles.skillBadge}>
            {post.skill_level}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.cardContent}>
          <h3 style={styles.postTitlePro}>{post.title}</h3>
          
          <div style={styles.gameInfoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Players Needed</span>
              <span style={styles.infoValue}>{post.players_needed}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date</span>
              <span style={styles.infoValue}>
                {new Date(post.game_datetime).toLocaleDateString()}
              </span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Time</span>
              <span style={styles.infoValue}>
                {new Date(post.game_datetime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>

          <div style={styles.descriptionBox}>
            <p style={styles.postDescriptionPro}>{post.description}</p>
          </div>

          {/* Interest Counter */}
          <div style={styles.interestCounter}>
            <span style={styles.interestIcon}>👥</span>
            <span style={styles.interestText}>
              {post.interested_users?.length || 0} interested
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionSection}>
          {isCreator ? (
            <div style={styles.creatorMessage}>
              <span style={styles.creatorIcon}>✨</span>
              Your post - responses will appear in your messages
            </div>
          ) : (
            <div style={styles.postButtonsPro}>
              <button 
                style={styles.sendMessageBtnPro}
                onClick={handleSendMessage}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1b5e20';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2e7d32';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                💬 Send Message
              </button>
              
              <button
                style={{
                  ...styles.interestedBtnPro,
                  backgroundColor: interestedState ? '#2e7d32' : '#81c784',
                  border: interestedState ? '2px solid #2e7d32' : '2px solid #81c784',
                }}
                disabled={loading}
                onClick={handleInterest}
                onMouseEnter={(e) => {
                  if (interestedState) {
                    e.target.style.backgroundColor = '#1b5e20';
                  } else {
                    e.target.style.backgroundColor = '#66bb6a';
                  }
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  if (interestedState) {
                    e.target.style.backgroundColor = '#2e7d32';
                  } else {
                    e.target.style.backgroundColor = '#81c784';
                  }
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {loading
                  ? "⏳ Loading..."
                  : interestedState
                    ? "✅ Interested"
                    : "🙋 Show Interest"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Original Chat Window - Rendered Outside the Card */}
      {showChat && (
        <ChatWindow
          targetUserId={post.created_by}
          targetUserName={post.created_by_name}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

const CreatePostModal = ({ venue, onClose, onPostCreated }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    skill_level: 'Beginner',
    game_datetime: '',
    description: '',
    players_needed: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = await getToken({ template: 'backend' });
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const requestBody = {
        ...formData,
        venue_id: venue._id
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch('http://127.0.0.1:8000/api/posts/create/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      // Always get the text first to see what was returned
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (response.ok) {
        // Try to parse as JSON if successful
        try {
          const data = JSON.parse(responseText);
          console.log('Success:', data);
          onPostCreated();
        } catch (parseError) {
          console.error('JSON parse error on success:', parseError);
          alert('Post may have been created but response parsing failed');
        }
      } else {
        // Log the error response
        console.error('Error response:', responseText);
        alert(`Error creating post (${response.status}): Check console for details`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error creating post: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Create Post for {venue.name}</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Skill Level:</label>
            <select
              value={formData.skill_level}
              onChange={(e) => setFormData({...formData, skill_level: e.target.value})}
              style={styles.select}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Competitive">Competitive</option>  
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Game Date & Time:</label>
            <input
              type="datetime-local"
              value={formData.game_datetime}
              onChange={(e) => setFormData({...formData, game_datetime: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Players Needed:</label>
            <input
              type="number"
              min="1"
              max="4"
              value={formData.players_needed}
              onChange={(e) => setFormData({...formData, players_needed: parseInt(e.target.value)})}
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={styles.textarea}
              rows="3"
              required
            />
          </div>
          
          <div style={styles.modalButtons}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  // Full screen container with light green background
  fullScreenContainer: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%)',
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Content container with scroll
  contentContainer: {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
  },
  
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    fontSize: '18px',
    color: '#5a7c5a',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%)',
  },
  
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    color: '#dc3545',
    fontSize: '18px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%)',
  },
  
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e8f5e8',
  },
  
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2d4a2f',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  welcome: {
    fontSize: '20px',
    color: '#5a7c5a',
    marginBottom: '32px',
  },

  // Search styles
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },

  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
  },

  searchIcon: {
    position: 'absolute',
    left: '20px',
    zIndex: 1,
    pointerEvents: 'none',
  },

  searchInput: {
    width: '100%',
    padding: '16px 24px 16px 56px',
    fontSize: '16px',
    border: '2px solid #d4e5d4',
    borderRadius: '50px',
    outline: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    color: '#333',
  },

  clearButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  },

  resultsInfo: {
    marginBottom: '0',
    textAlign: 'center',
  },

  resultsText: {
    fontSize: '16px',
    color: '#5a7c5a',
    margin: 0,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block',
  },

  // No results styles
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    margin: '20px',
    border: '1px solid #e8f5e8',
  },

  noResultsIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7,
  },

  noResultsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '8px',
  },

  noResultsText: {
    fontSize: '16px',
    color: '#5a7c5a',
    margin: 0,
  },

  showAllButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '16px',
    padding: 0,
    fontWeight: '500',
  },
  
  // Venues container to contain all venue cards
  venuesContainer: {
    maxWidth: '100%',
    width: '100%',
  },
  
  venueCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '100%',
    border: '1px solid #e8f5e8',
  },
  
  venueName: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#2d4a2f',
  },
  
  venueContent: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
  },
  
  imageContainer: {
    flex: '0 0 300px',
  },
  
  venueImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
    backgroundColor: '#ddd',
  },
  
  venueInfo: {
    flex: '1',
  },
  
  location: {
    fontSize: '16px',
    color: '#5a7c5a',
    marginBottom: '8px',
  },
  
  description: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  
  buttonContainer: {
    display: 'flex',
    gap: '12px',
  },
  
  createPostBtn: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },
  
  seeSlotsBtn: {
    backgroundColor: '#6fa85a',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  },

  // Posts section styles
  postsSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '10px',
    paddingTop: '8px',
  },
  
  postsLoading: {
    textAlign: 'center',
    padding: '20px',
    color: '#5a7c5a',
    fontStyle: 'italic',
  },
  
  noPosts: {
    textAlign: 'center',
    padding: '20px',
    color: '#5a7c5a',
    fontStyle: 'italic',
  },

  // Professional Post Card Styles
  postCardPro: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e8f5e8',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
    padding: '0',
    minWidth: '380px',
    maxWidth: '380px',
    flex: '0 0 auto',
    marginRight: '0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  headerBadge: {
    background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #e8f5e8',
  },

  avatarIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(46, 125, 50, 0.3)',
  },

  headerInfo: {
    flex: 1,
  },

  postedByText: {
    fontSize: '11px',
    color: '#81c784',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },

  authorName: {
    fontSize: '14px',
    color: '#2e7d32',
    fontWeight: '600',
  },

  skillBadge: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  cardContent: {
    padding: '20px',
  },

  postTitlePro: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: '16px',
    lineHeight: '1.3',
    margin: '0 0 16px 0',
  },

  gameInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },

  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },

  infoLabel: {
    fontSize: '10px',
    color: '#81c784',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },

  infoValue: {
    fontSize: '13px',
    color: '#2e7d32',
    fontWeight: '600',
  },

  descriptionBox: {
    backgroundColor: '#f8fffe',
    border: '1px solid #e8f5e8',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },

  postDescriptionPro: {
    fontSize: '14px',
    color: '#424242',
    lineHeight: '1.5',
    margin: 0,
  },

  interestCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
    padding: '8px',
    backgroundColor: '#f1f8e9',
    borderRadius: '8px',
    border: '1px solid #e8f5e8',
  },

  interestIcon: {
    fontSize: '14px',
  },

  interestText: {
    fontSize: '12px',
    color: '#2e7d32',
    fontWeight: '600',
  },

  actionSection: {
    padding: '16px 20px 20px 20px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },

  postButtonsPro: {
    display: 'flex',
    gap: '10px',
  },

  sendMessageBtnPro: {
    flex: 1,
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },

  interestedBtnPro: {
    flex: 1,
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },

  creatorMessage: {
    textAlign: 'center',
    color: '#66bb6a',
    fontSize: '13px',
    fontStyle: 'italic',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  creatorIcon: {
    fontSize: '16px',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '28px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
  
  modalTitle: {
    marginBottom: '20px',
    color: '#2d4a2f',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  
  formGroup: {
    marginBottom: '16px',
  },
  
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#2d4a2f',
  },
  
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #d4e5d4',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #d4e5d4',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #d4e5d4',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

// Add global styles for focus states and animations
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    input[type="text"]:focus, input[type="datetime-local"]:focus, 
    textarea:focus, select:focus {
      border-color: #6fa85a !important;
      box-shadow: 0 0 0 2px rgba(111,168,90,0.2) !important;
      outline: none !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%) !important;
      min-height: 100vh;
    }

    /* Scrollbar styling for webkit browsers */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(111,168,90,0.3);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(111,168,90,0.5);
    }
  `;
  document.head.appendChild(style);
};

// Call this once when component mounts
if (typeof window !== 'undefined') {
  addGlobalStyles();
}

export default App;
