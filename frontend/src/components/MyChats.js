import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import ChatWindow from './ChatWindow';

const MyChats = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  const currentUserId = user?.id || user?.user_id;

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch('http://127.0.0.1:8000/api/conversations/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      setError('Error loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
  };

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>My Chats</h2>

      {loading && <div style={styles.loading}>Loading conversations...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && conversations.length === 0 && (
        <div style={styles.noChats}>
          <p>No conversations yet.</p>
          <p>Start chatting by clicking "Send Message" on any post!</p>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div style={styles.conversationsList}>
          {conversations.map((conversation) => (
            <div
              key={conversation.user_id}
              style={styles.conversationItem}
              onClick={() => handleChatSelect(conversation)}
            >
              <div style={styles.conversationInfo}>
                <div style={styles.conversationHeader}>
                  <h4 style={styles.userName}>{conversation.user_name}</h4>
                  <span style={styles.messageTime}>
                    {formatMessageTime(conversation.last_message_time)}
                  </span>
                </div>
                
                <div style={styles.lastMessageContainer}>
                  <span style={styles.lastMessageSender}>
                    {conversation.last_sender_id === currentUserId ? 'You: ' : ''}
                  </span>
                  <span style={styles.lastMessage}>
                    {conversation.last_message.length > 50 
                      ? conversation.last_message.substring(0, 50) + '...'
                      : conversation.last_message}
                  </span>
                </div>
              </div>
              
              <div style={styles.conversationActions}>
                <button style={styles.chatButton}>Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {selectedChat && (
        <ChatWindow
          targetUserId={selectedChat.user_id}
          targetUserName={selectedChat.user_name}
          onClose={() => {
            setSelectedChat(null);
            fetchConversations(); // Refresh conversations when chat closes
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    fontSize: '30px',
    marginBottom: '32px',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: '#dc3545',
    fontSize: '18px',
  },
  noChats: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    fontSize: '16px',
  },
  conversationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  conversationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ':hover': {
      backgroundColor: '#e9ecef',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  userName: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  messageTime: {
    fontSize: '12px',
    color: '#666',
  },
  lastMessageContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  lastMessageSender: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: '14px',
    color: '#666',
  },
  conversationActions: {
    marginLeft: '16px',
  },
  chatButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// Add hover effect dynamically
const addHoverEffect = () => {
  const style = document.createElement('style');
  style.textContent = `
    .conversation-item:hover {
      background-color: #e9ecef !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
};

// Call this once when component mounts
if (typeof window !== 'undefined') {
  addHoverEffect();
}

export default MyChats;
