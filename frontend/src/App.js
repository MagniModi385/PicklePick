import React, { useEffect, useState } from 'react';
import { useUser, useAuth, SignOutButton } from '@clerk/clerk-react';
import ChatWindow from './components/ChatWindow';

function App() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [venues, setVenues] = useState([]);
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

  if (loading) return <div style={styles.loading}>Loading venues...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.fullScreenContainer}>
      <div style={styles.contentContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Find people to play here. At PicklePick</h1>
          <p style={styles.welcome}>Welcome {user?.fullName || user?.firstName || 'Player'}!</p>
        </div>
        
        <div style={styles.venuesContainer}>
          {venues.map((venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
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
        onInterestToggled && onInterestToggled(); // Refresh post state in parent if needed
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

  // Button color logic
  const getInterestButtonStyle = () => {
    if (interestedState) {
      return {
        ...styles.interestedBtn,
        backgroundColor: "#28a745", // Green for toggled ON (interested)
        color: "white",
        border: "2px solid #28a745",
        cursor: loading ? "wait" : "pointer",
      };
    } else {
      return {
        ...styles.interestedBtn,
        backgroundColor: "#ffc107", // Yellow for toggled OFF (not interested)
        color: "black",
        border: "2px solid #ffc107",
        cursor: loading ? "wait" : "pointer",
      };
    }
  };

  return (
    <div style={styles.postCard}>
      <div style={styles.postHeader}>Posted by: {post.created_by_name || "Anonymous"}</div>
      <h3 style={styles.postTitle}>{post.title}</h3>
      <p style={styles.postDetail}>Players required: {post.players_needed}</p>
      <p style={styles.postDetail}>Skill level: {post.skill_level}</p>
      <div style={styles.postDateTime}>
        <span>Game date: {new Date(post.game_datetime).toLocaleDateString()}</span>
        <span>Game time: {new Date(post.game_datetime).toLocaleTimeString()}</span>
      </div>
      <p style={styles.postDescription}>{post.description}</p>
      <p style={styles.postInterest}>{post.interested_users?.length || 0} interested</p>
      
      <div style={styles.postButtons}>
        {isCreator ? (
          <div style={{ color: "#999", fontStyle: "italic", marginTop: "10px" }}>
            You cannot respond to your own post.
          </div>
        ) : (
          <>
            <button 
              style={styles.sendMessageBtn}
              onClick={handleSendMessage}
            >
              Send Message
            </button>
            <button
              style={getInterestButtonStyle()}
              disabled={loading}
              onClick={handleInterest}
            >
              {loading
                ? "Loading..."
                : interestedState
                  ? "✓ Interested"
                  : "Interested"}
            </button>
          </>
        )}
      </div>

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          targetUserId={post.created_by}
          targetUserName={post.created_by_name}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
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
  // Full screen container
  fullScreenContainer: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Content container with scroll
  contentContainer: {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
  },
  
  // Venues container to contain all venue cards
  venuesContainer: {
    maxWidth: '100%',
    width: '100%',
  },
  
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    fontSize: '18px',
  },
  
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    color: 'red',
    fontSize: '18px',
    textAlign: 'center',
  },
  
  header: {
    marginBottom: '30px',
  },
  
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  
  welcome: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
  },
  
  venueCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '100%',
  },
  
  venueName: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  
  venueContent: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  
  imageContainer: {
    flex: '0 0 300px',
  },
  
  venueImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#ddd',
  },
  
  venueInfo: {
    flex: '1',
  },
  
  location: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px',
  },
  
  description: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '20px',
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
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },
  
  seeSlotsBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  },

  // Posts section styles
  postsSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    overflowX: 'auto',
    paddingBottom: '10px',
  },

  postCard: {
    backgroundColor: '#e9ecef',
    padding: '16px',
    borderRadius: '8px',
    minWidth: '340px',
    maxWidth: '340px',
    flex: '0 0 auto',
    marginRight: '0',
  },
  
  postHeader: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  
  postTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  
  postDetail: {
    fontSize: '14px',
    color: '#333',
    margin: '4px 0',
  },
  
  postDateTime: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#333',
    margin: '8px 0',
  },
  
  postDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  
  postInterest: {
    fontSize: '12px',
    color: '#28a745',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  
  postButtons: {
    display: 'flex',
    gap: '8px',
  },
  
  sendMessageBtn: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  
  interestedBtn: {
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  
  postsLoading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  
  noPosts: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontStyle: 'italic',
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
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  
  modalTitle: {
    marginBottom: '20px',
    color: '#333',
  },
  
  formGroup: {
    marginBottom: '16px',
  },
  
  label: {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '500',
    color: '#333',
  },
  
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default App;
