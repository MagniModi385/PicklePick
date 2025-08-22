const Contact = () => {
  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          We're here to help! Get in touch with the PicklePick team.
        </p>
      </div>

      <div style={styles.contentWrapper}>
        {/* Contact Info Card */}
        <div style={styles.contactCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Get in Touch</h2>
            <p style={styles.cardDescription}>
              Have questions about PicklePick? We'd love to hear from you!
            </p>
          </div>

          <div style={styles.contactMethods}>
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>📧</div>
              <div style={styles.contactDetails}>
                <h3 style={styles.contactLabel}>Email Us</h3>
                <p style={styles.contactValue}>chirplabproductions@gmail.com</p>
                <p style={styles.contactNote}>We typically respond within 24 hours</p>
              </div>
            </div>

            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>💬</div>
              <div style={styles.contactDetails}>
                <h3 style={styles.contactLabel}>Community Support</h3>
                <p style={styles.contactValue}>Ask questions in-app</p>
                <p style={styles.contactNote}>Connect with other players for help</p>
              </div>
            </div>

            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>🏓</div>
              <div style={styles.contactDetails}>
                <h3 style={styles.contactLabel}>About PicklePick</h3>
                <p style={styles.contactValue}>Connecting pickleball players</p>
                <p style={styles.contactNote}>Find games, make friends, play more</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Card */}
        <div style={styles.faqCard}>
          <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
          
          <div style={styles.faqList}>
            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>❓</span>
                How do I create a post for a game?
              </div>
              <p style={styles.faqAnswer}>
                Visit any venue page and click the "Create Post" button. Fill in your game details like date, time, skill level, and how many players you need.
              </p>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>🔒</span>
                Is my messaging secure and private?
              </div>
              <p style={styles.faqAnswer}>
                Yes! All messages in PicklePick are encrypted to protect your privacy and personal information.
              </p>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>📍</span>
                How do I add a new venue?
              </div>
              <p style={styles.faqAnswer}>
                Email us at chiplabproductions@gmail.com with the venue name, address, and details. We'll review and add it to our platform.
              </p>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>💰</span>
                Is PicklePick free to use?
              </div>
              <p style={styles.faqAnswer}>
                Absolutely! PicklePick is completely free for players to find games, message other players, and connect with the pickleball community.
              </p>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>👥</span>
                How does the interest system work?
              </div>
              <p style={styles.faqAnswer}>
                When you see a post you like, click "Show Interest." The post creator will see you're interested and can message you directly to coordinate the game.
              </p>
            </div>

            <div style={styles.faqItem}>
              <div style={styles.faqQuestion}>
                <span style={styles.faqIcon}>🎯</span>
                What skill levels are supported?
              </div>
              <p style={styles.faqAnswer}>
                We support Beginner, Intermediate, Advanced, and Competitive skill levels. This helps match you with players of similar abilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h3 style={styles.ctaTitle}>Ready to Play?</h3>
          <p style={styles.ctaText}>
            Join the PicklePick community and start connecting with players in your area!
          </p>
          <div style={styles.ctaButtons}>
            <button 
              style={styles.primaryButton}
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
              🏓 Find Games
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => window.location.href = '/profile'}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#66bb6a';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#81c784';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              👤 Update Profile
            </button>
          </div>
        </div>
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

  header: {
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '50px 30px',
    marginBottom: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    maxWidth: '800px',
    margin: '0 auto 40px auto',
  },

  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '20px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '20px',
    color: '#5a7c5a',
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto',
  },

  contentWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '40px',
  },

  contactCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  cardHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  cardTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  cardDescription: {
    fontSize: '18px',
    color: '#5a7c5a',
    lineHeight: '1.6',
  },

  contactMethods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },

  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '24px',
    backgroundColor: '#f8fffe',
    borderRadius: '16px',
    border: '1px solid #e8f5e8',
    transition: 'all 0.3s ease',
  },

  contactIcon: {
    fontSize: '36px',
    width: '60px',
    height: '60px',
    backgroundColor: '#e8f5e8',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  contactDetails: {
    flex: 1,
  },

  contactLabel: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2d4a2f',
    margin: '0 0 8px 0',
  },

  contactValue: {
    fontSize: '16px',
    color: '#2e7d32',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },

  contactNote: {
    fontSize: '14px',
    color: '#5a7c5a',
    margin: 0,
    lineHeight: '1.4',
  },

  faqCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  faqTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '30px',
    textAlign: 'center',
  },

  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  faqItem: {
    padding: '24px',
    backgroundColor: '#f8fffe',
    borderRadius: '16px',
    border: '1px solid #e8f5e8',
    transition: 'all 0.3s ease',
  },

  faqQuestion: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2d4a2f',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  faqIcon: {
    fontSize: '20px',
  },

  faqAnswer: {
    fontSize: '16px',
    color: '#5a7c5a',
    lineHeight: '1.6',
    margin: 0,
  },

  ctaSection: {
    marginTop: '60px',
    display: 'flex',
    justifyContent: 'center',
  },

  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  ctaTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  ctaText: {
    fontSize: '18px',
    color: '#5a7c5a',
    marginBottom: '30px',
    lineHeight: '1.6',
  },

  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  primaryButton: {
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

  secondaryButton: {
    backgroundColor: '#81c784',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
  },
};

// Add hover effects for FAQ items
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .faq-item:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15) !important;
    }
    
    .contact-item:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15) !important;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        padding: 0 16px !important;
      }
      
      .contact-methods {
        grid-template-columns: 1fr !important;
      }
      
      .cta-buttons {
        flex-direction: column !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Apply hover effects
if (typeof window !== 'undefined') {
  addHoverEffects();
}

export default Contact;
