import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import ChatWindow from './ChatWindow';

const MyPosts = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken({ template: "backend" });
      const res = await fetch('http://127.0.0.1:8000/api/posts/my/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        const errText = await res.text();
        setError(`Error ${res.status}: ${errText}`);
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const token = await getToken({ template: "backend" });
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        alert('Post deleted successfully!');
      } else {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          alert('Error deleting post: ' + errorJson.error);
        } catch {
          alert('Error deleting post: ' + errorText);
        }
      }
    } catch (err) {
      alert('Network error deleting post: ' + err.message);
    }
  };

  const handleUpdate = (post) => {
    setEditingPost(post);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setEditingPost(null);
    fetchMyPosts();
  };

  const handleSendMessage = (profile) => {
    setChatTarget({
      userId: profile.user_id,
      userName: profile.full_name
    });
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatTarget(null);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>My Posts</h1>
          <p style={styles.subtitle}>
            Manage your game posts and connect with interested players
          </p>
        </div>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{posts.length}</div>
            <div style={styles.statLabel}>Active Posts</div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <div style={styles.errorText}>{error}</div>
        </div>
      )}

      {/* Empty State */}
      {!error && posts.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏓</div>
          <h3 style={styles.emptyTitle}>No Posts Yet</h3>
          <p style={styles.emptyText}>
            Create your first post to start organizing games with other players!
          </p>
          <button 
            style={styles.createButton}
            onClick={() => window.location.href = '/'}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1b5e20';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2e7d32';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            Find Venues & Create Post
          </button>
        </div>
      )}

      {/* Posts Grid */}
      {!error && posts.length > 0 && (
        <div style={styles.postsGrid}>
          {posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post}
              onUpdate={() => handleUpdate(post)}
              onDelete={() => handleDelete(post._id)}
              onSendMessage={handleSendMessage}
            />
          ))}
        </div>
      )}

      {/* Update Modal - Original Version */}
      {showUpdateModal && editingPost && (
        <UpdatePostModal
          post={editingPost}
          onClose={() => setShowUpdateModal(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {/* Chat Window */}
      {showChat && chatTarget && (
        <ChatWindow
          targetUserId={chatTarget.userId}
          targetUserName={chatTarget.userName}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

const PostCard = ({ post, onUpdate, onDelete, onSendMessage }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        ...styles.postCard,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
        boxShadow: isHovered 
          ? '0 12px 24px rgba(46, 125, 50, 0.2)' 
          : '0 4px 12px rgba(46, 125, 50, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Post Header */}
      <div style={styles.postHeader}>
        <h3 style={styles.postTitle}>{post.title}</h3>
        <div style={styles.skillBadge}>
          {post.skill_level}
        </div>
      </div>

      {/* Game Details */}
      <div style={styles.gameDetails}>
        <div style={styles.detailRow}>
          <div style={styles.detailItem}>
            <span style={styles.detailIcon}>👥</span>
            <span style={styles.detailText}>{post.players_needed} players needed</span>
          </div>
        </div>
        
        <div style={styles.detailRow}>
          <div style={styles.detailItem}>
            <span style={styles.detailIcon}>📅</span>
            <span style={styles.detailText}>
              {new Date(post.game_datetime).toLocaleDateString()}
            </span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailIcon}>🕐</span>
            <span style={styles.detailText}>
              {new Date(post.game_datetime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={styles.descriptionContainer}>
        <p style={styles.description}>{post.description}</p>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button 
          style={styles.updateButton}
          onClick={onUpdate}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e67e00';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ff9800';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✏️ Update
        </button>
        <button 
          style={styles.deleteButton}
          onClick={onDelete}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#c62828';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f44336';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Interested Players Section */}
      <div style={styles.interestedSection}>
        <div style={styles.interestedHeader}>
          <h4 style={styles.interestedTitle}>
            👥 Interested Players ({post.interested_profiles?.length || 0})
          </h4>
        </div>
        
        {(!post.interested_profiles || post.interested_profiles.length === 0) ? (
          <div style={styles.noInterested}>
            <span style={styles.noInterestedIcon}>😴</span>
            <span>No one has shown interest yet</span>
          </div>
        ) : (
          <div style={styles.interestedGrid} className="interested-grid">
            {post.interested_profiles.map(profile => (
              <div key={profile.user_id} style={styles.interestedCard}>
                <div style={styles.playerInfo}>
                  <div style={styles.playerAvatar}>
                    {profile.full_name ? profile.full_name[0].toUpperCase() : 'P'}
                  </div>
                  <div style={styles.playerDetails}>
                    <div style={styles.playerName}>{profile.full_name || 'Anonymous'}</div>
                    <div style={styles.playerSkill}>
                      {profile.skill_level || 'Not set'}
                    </div>
                  </div>
                </div>
                <button 
                  style={styles.messageButton}
                  onClick={() => onSendMessage(profile)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1b5e20';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2e7d32';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  💬
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Original Update Modal (with scrolling)
const UpdatePostModal = ({ post, onClose, onUpdateSuccess }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    title: post.title || '',
    skill_level: post.skill_level || 'Beginner',
    game_datetime: post.game_datetime ? new Date(post.game_datetime).toISOString().slice(0, 16) : '',
    description: post.description || '',
    players_needed: post.players_needed || 1
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch(`http://127.0.0.1:8000/api/posts/${post._id}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Post updated successfully!');
        onUpdateSuccess();
      } else {
        const error = await response.json();
        alert('Error updating post: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating post: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Update Post: {post.title}</h3>
        
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
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 50%, #f0f8f0 100%)',
    padding: '20px',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },

  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e8f5e8',
    borderTop: '4px solid #2e7d32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },

  loadingText: {
    fontSize: '18px',
    color: '#5a7c5a',
  },

  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto 30px auto',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '18px',
    color: '#5a7c5a',
    margin: 0,
  },

  statsContainer: {
    display: 'flex',
    gap: '20px',
  },

  statCard: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f1f8e9',
    borderRadius: '16px',
    border: '1px solid #e8f5e8',
    minWidth: '120px',
  },

  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: '8px',
  },

  statLabel: {
    fontSize: '14px',
    color: '#5a7c5a',
    fontWeight: '500',
  },

  errorContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: '1px solid #ffcdd2',
  },

  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  errorText: {
    fontSize: '18px',
    color: '#c62828',
    fontWeight: '500',
  },

  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  emptyIcon: {
    fontSize: '80px',
    marginBottom: '24px',
  },

  emptyTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  emptyText: {
    fontSize: '18px',
    color: '#5a7c5a',
    marginBottom: '32px',
    lineHeight: '1.6',
  },

  createButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
  },

  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', // Slightly bigger from 320px
    gap: '22px', // Slightly bigger from 20px
    maxWidth: '1300px', // Slightly bigger from 1200px
    margin: '0 auto',
    padding: '0 20px',
  },

  // Slightly bigger post card
  postCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '14px', // Slightly bigger from 12px
    padding: '18px', // Slightly bigger from 16px
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)',
    border: '1px solid #e8f5e8',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxHeight: '380px', // Slightly bigger from 350px
    width: '100%',
    maxWidth: '420px', // Slightly bigger from 380px
    justifySelf: 'center',
  },

  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px', // Slightly bigger from 12px
  },

  postTitle: {
    fontSize: '19px', // Slightly bigger from 18px
    fontWeight: 'bold',
    color: '#2d4a2f',
    margin: 0,
    flex: 1,
    paddingRight: '14px', // Slightly bigger from 12px
  },

  skillBadge: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '5px 14px', // Slightly bigger from 4px 12px
    borderRadius: '18px', // Slightly bigger from 16px
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  gameDetails: {
    marginBottom: '14px', // Slightly bigger from 12px
  },

  detailRow: {
    display: 'flex',
    gap: '14px', // Slightly bigger from 12px
    marginBottom: '9px', // Slightly bigger from 8px
  },

  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px', // Slightly bigger from 6px
    flex: 1,
  },

  detailIcon: {
    fontSize: '15px', // Slightly bigger from 14px
  },

  detailText: {
    fontSize: '13px',
    color: '#5a7c5a',
    fontWeight: '500',
  },

  descriptionContainer: {
    backgroundColor: '#f8fffe',
    border: '1px solid #e8f5e8',
    borderRadius: '9px', // Slightly bigger from 8px
    padding: '11px', // Slightly bigger from 10px
    marginBottom: '14px', // Slightly bigger from 12px
  },

  description: {
    fontSize: '13px',
    color: '#424242',
    lineHeight: '1.3',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  actionButtons: {
    display: 'flex',
    gap: '9px', // Slightly bigger from 8px
    marginBottom: '18px', // Slightly bigger from 16px
  },

  updateButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '9px 14px', // Slightly bigger from 8px 12px
    borderRadius: '7px', // Slightly bigger from 6px
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '75px', // Slightly bigger from 70px
    textAlign: 'center',
  },

  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '9px 14px', // Slightly bigger from 8px 12px
    borderRadius: '7px', // Slightly bigger from 6px
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '75px', // Slightly bigger from 70px
    textAlign: 'center',
  },

  interestedSection: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '14px', // Slightly bigger from 12px
  },

  interestedHeader: {
    marginBottom: '11px', // Slightly bigger from 10px
  },

  interestedTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d4a2f',
    margin: 0,
  },

  noInterested: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px', // Slightly bigger from 6px
    padding: '14px', // Slightly bigger from 12px
    backgroundColor: '#f8f9fa',
    borderRadius: '9px', // Slightly bigger from 8px
    color: '#5a7c5a',
    fontSize: '12px',
    fontStyle: 'italic',
    justifyContent: 'center',
  },

  noInterestedIcon: {
    fontSize: '16px',
  },

  interestedGrid: {
    display: 'flex',
    gap: '11px', // Slightly bigger from 10px
    overflowX: 'auto',
    paddingBottom: '7px', // Slightly bigger from 6px
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(46, 125, 50, 0.3) transparent',
  },

  interestedCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px', // Slightly bigger from 6px
    padding: '11px', // Slightly bigger from 10px
    backgroundColor: '#f8fffe',
    borderRadius: '9px', // Slightly bigger from 8px
    border: '1px solid #e8f5e8',
    minWidth: '110px', // Slightly bigger from 100px
    maxWidth: '110px', // Slightly bigger from 100px
    flexShrink: 0,
  },

  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px', // Slightly bigger from 6px
    textAlign: 'center',
    width: '100%',
  },

  playerAvatar: {
    width: '32px', // Slightly bigger from 30px
    height: '32px', // Slightly bigger from 30px
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px', // Slightly bigger from 12px
    fontWeight: 'bold',
  },

  playerDetails: {
    width: '100%',
  },

  playerName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2d4a2f',
    marginBottom: '2px',
    wordWrap: 'break-word',
    lineHeight: '1.2',
  },

  playerSkill: {
    fontSize: '9px',
    color: '#5a7c5a',
  },

  messageButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '5px 9px', // Slightly bigger from 4px 8px
    borderRadius: '5px', // Slightly bigger from 4px
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },

  // Original Modal Styles (with scrolling)
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
    fontSize: '20px',
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

// Add CSS animations and custom scrollbar
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    input:focus, select:focus, textarea:focus {
      border-color: #6fa85a !important;
      box-shadow: 0 0 0 3px rgba(111,168,90,0.2) !important;
    }

    /* Custom scrollbar for interested players section */
    .interested-grid::-webkit-scrollbar {
      height: 4px;
    }
    
    .interested-grid::-webkit-scrollbar-track {
      background: rgba(232, 245, 232, 0.5);
      border-radius: 2px;
    }
    
    .interested-grid::-webkit-scrollbar-thumb {
      background: rgba(46, 125, 50, 0.4);
      border-radius: 2px;
    }
    
    .interested-grid::-webkit-scrollbar-thumb:hover {
      background: rgba(46, 125, 50, 0.6);
    }

    @media (max-width: 768px) {
      .posts-grid {
        grid-template-columns: 1fr !important;
        padding: 0 10px !important;
      }
      
      .header {
        flex-direction: column !important;
        text-align: center !important;
        gap: 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  addGlobalStyles();
}

export default MyPosts;
