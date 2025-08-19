import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

// Modern encryption/decryption functions
const encryptMessage = (message) => {
  try {
    // Simple Base64 encoding with proper Unicode handling
    return btoa(encodeURIComponent(message));
  } catch (error) {
    console.error('Encryption error:', error);
    return message;
  }
};

const decryptMessage = (encryptedMessage) => {
  try {
    // Simple Base64 decoding with proper Unicode handling
    return decodeURIComponent(atob(encryptedMessage));
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage;
  }
};

const ChatWindow = ({ targetUserId, targetUserName, onClose }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUserId = user?.id || user?.user_id;

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch(`http://127.0.0.1:8000/api/messages/${targetUserId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        
        // Decrypt messages before displaying
        const decryptedMessages = data.map(msg => ({
          ...msg,
          message: msg.message_encrypted ? decryptMessage(msg.message_encrypted) : msg.message || 'Message not available'
        }));
        
        setMessages(decryptedMessages);
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageToSend = newMessage.trim();
    
    try {
      const token = await getToken({ template: 'backend' });
      const response = await fetch('http://127.0.0.1:8000/api/messages/send/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: targetUserId,
          message: encryptMessage(messageToSend), // Encrypt before sending
        }),
      });

      if (response.ok) {
        setNewMessage('');
        
        // Add message to local state immediately for better UX
        const tempMessage = {
          _id: Date.now().toString(),
          sender_id: currentUserId,
          sender_name: 'You',
          message: messageToSend, // Display original message
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);
        
        // Refresh messages after a short delay
        setTimeout(fetchMessages, 500);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Error sending message');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error sending message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Chat with {targetUserName}</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.messagesContainer}>
          {loading ? (
            <div style={styles.loadingMessage}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={styles.noMessages}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                style={{
                  ...styles.messageRow,
                  justifyContent: message.sender_id === currentUserId ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: message.sender_id === currentUserId ? '#007bff' : '#e9ecef',
                    color: message.sender_id === currentUserId ? 'white' : 'black',
                  }}
                >
                  <div style={styles.messageText}>
                    {message.message}
                  </div>
                  <div style={styles.messageTime}>
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={styles.messageForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={styles.messageInput}
            disabled={sending}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              ...styles.sendButton,
              opacity: !newMessage.trim() || sending ? 0.6 : 1,
              cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  chatContainer: {
    width: '90%',
    maxWidth: '500px',
    height: '70%',
    maxHeight: '600px',
    backgroundColor: 'white',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  messagesContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#fafafa',
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
    fontStyle: 'italic',
  },
  noMessages: {
    textAlign: 'center',
    color: '#666',
    padding: '40px 20px',
    fontStyle: 'italic',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '8px',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '18px',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  messageText: {
    marginBottom: '4px',
    lineHeight: '1.4',
    fontSize: '14px',
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7,
    textAlign: 'right',
  },
  messageForm: {
    padding: '16px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'white',
  },
  messageInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '25px',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    minWidth: '60px',
  },
};

export default ChatWindow;
