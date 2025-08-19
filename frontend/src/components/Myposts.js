import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import ChatWindow from './ChatWindow'; // Import the ChatWindow component

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
    fetchMyPosts(); // Refresh posts
  };

  // Chat functionality
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

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>My Posts</h2>
      
      {loading && <div>Loading...</div>}
      {error && <div style={styles.error}>{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div>No posts found. Create a post to see it here.</div>
      )}
      
      {!loading && !error && posts.map(post => (
        <div key={post._id} style={styles.postCard}>
          <h3 style={styles.title}>{post.title}</h3>
          <div>Players required: {post.players_needed}</div>
          <div>Skill level: {post.skill_level}</div>
          <div>
            Game date: {new Date(post.game_datetime).toLocaleDateString()}
            &nbsp;|&nbsp;
            Game time: {new Date(post.game_datetime).toLocaleTimeString()}
          </div>
          <div>Description: {post.description}</div>
          
          <div style={styles.buttonRow}>
            <button 
              style={styles.updateBtn} 
              onClick={() => handleUpdate(post)}
            >
              Update
            </button>
            <button 
              style={styles.deleteBtn} 
              onClick={() => handleDelete(post._id)}
            >
              Delete
            </button>
          </div>
          
          <div style={styles.interestedWrap}>
            <strong>Interested people:</strong>
            {post.interested_profiles && post.interested_profiles.length === 0 ? (
              <div style={styles.noInterest}>None yet</div>
            ) : (
              <div style={styles.interestedList}>
                {post.interested_profiles?.map(profile => (
                  <div key={profile.user_id} style={styles.interestedCard}>
                    <div><b>Name:</b> {profile.full_name}</div>
                    <div><b>Skill Level:</b> {profile.skill_level || 'Not set'}</div>
                    <button 
                      style={styles.messageBtn}
                      onClick={() => handleSendMessage(profile)}
                    >
                      Send Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Update Post Modal */}
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

// UpdatePostModal component remains the same...
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

// Styles remain the same...
const styles = {
  container: { padding: 24, maxWidth: 800, margin: '0 auto' },
  header: { fontSize: 30, marginBottom: 32 },
  postCard: {
    background: "#f8f9fa",
    padding: 18,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  title: { fontSize: 22, marginBottom: 10 },
  buttonRow: { display: "flex", gap: 12, marginTop: 16 },
  updateBtn: { 
    background: "#ffc107", 
    padding: "10px 20px", 
    borderRadius: 6, 
    border: 'none', 
    cursor: "pointer",
    fontSize: "14px"
  },
  deleteBtn: { 
    background: "#dc3545", 
    color: "white", 
    padding: "10px 20px", 
    borderRadius: 6, 
    border: 'none', 
    cursor: "pointer",
    fontSize: "14px"
  },
  interestedWrap: { marginTop: 18, marginBottom: 8 },
  noInterest: { color: "#888", fontStyle: "italic", marginLeft: 8 },
  interestedList: { display: "flex", flexDirection: "row", gap: 18, overflowX: "auto" },
  interestedCard: {
    background: "#ececec",
    padding: "10px 16px",
    borderRadius: 6,
    minWidth: 160,
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  messageBtn: { 
    background: "#007bff", 
    color: "white", 
    padding: "6px 12px", 
    borderRadius: 4, 
    border: 'none', 
    marginTop: 5,
    fontSize: "12px",
    cursor: "pointer",
  },
  error: { color: "#dc3545", marginBottom: 20 },
  
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

export default MyPosts;
