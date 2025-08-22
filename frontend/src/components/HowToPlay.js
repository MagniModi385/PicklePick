
import React from 'react';

const HowToPlay = () => {
  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>How to Play Pickleball</h1>
        <p style={styles.subtitle}>
          Learn the basics of America's fastest-growing sport! Watch these videos to get started.
        </p>
      </div>

      <div style={styles.contentWrapper}>
        {/* Shorts Video Section */}
        <div style={styles.videoSection}>
          <div style={styles.videoCard}>
            <h2 style={styles.videoTitle}>
              🏓 Quick Pickleball Action
            </h2>
            <p style={styles.videoDescription}>
              Get a quick glimpse of pickleball in action! This short video shows the excitement and energy of the game.
            </p>
            
            <div style={styles.shortsContainer}>
              <iframe
                width="400"
                height="700"
                src="https://www.youtube.com/embed/mrQOpJEvjyk"
                title="Pickleball Shorts"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.shortsVideo}
                className="shorts-video"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Rules Video Section */}
        <div style={styles.videoSection}>
          <div style={styles.videoCard}>
            <h2 style={styles.videoTitle}>
              📚 Complete Pickleball Rules & Guide
            </h2>
            <p style={styles.videoDescription}>
              Learn all the rules, techniques, and strategies you need to start playing pickleball like a pro!
            </p>
            
            <div style={styles.rulesContainer}>
              <iframe
                width="900"
                height="600"
                src="https://www.youtube.com/embed/rD1O3R9B0Sw?start=9"
                title="How to Play Pickleball - Complete Rules"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.rulesVideo}
                className="rules-video"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Rest of your component stays the same... */}
        
        {/* Quick Tips Section */}
        <div style={styles.tipsSection}>
          <div style={styles.tipsCard}>
            <h2 style={styles.tipsTitle}>🎯 Quick Pickleball Tips</h2>
            
            <div style={styles.tipsGrid}>
              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>🏓</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipHeading}>Equipment Needed</h3>
                  <p style={styles.tipText}>
                    Paddle, perforated ball, net (20" high at center), and a court
                  </p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>📏</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipHeading}>Court Dimensions</h3>
                  <p style={styles.tipText}>
                    20' × 44' court with a 7-foot non-volley zone on each side
                  </p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>🎾</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipHeading}>Serving Rules</h3>
                  <p style={styles.tipText}>
                    Serve underhand, diagonally cross-court, ball must bounce once
                  </p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>⚡</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipHeading}>The Kitchen</h3>
                  <p style={styles.tipText}>
                    No volleying in the 7-foot non-volley zone near the net
                  </p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>🏆</div>
                <div styles={styles.tipContent}>
                  <h3 style={styles.tipHeading}>Scoring</h3>
                  <p style={styles.tipText}>
                    Games to 11, win by 2. Only serving team can score points
                  </p>
                </div>
              </div>

              <div style={styles.tipItem}>
                <div style={styles.tipIcon}>👥</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipHeading}>Players</h3>
                  <p style={styles.tipText}>
                    2 or 4 players (singles or doubles). Doubles is more common
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={styles.ctaSection}>
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>Ready to Play? 🏓</h2>
            <p style={styles.ctaText}>
              Now that you know the basics, find courts and players near you!
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
                Find Courts Near You
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
                Update Your Skill Level
              </button>
            </div>
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
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },

  videoSection: {
    display: 'flex',
    justifyContent: 'center',
  },

  videoCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    textAlign: 'center',
    width: '100%',
    maxWidth: '900px',
  },

  videoTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  videoDescription: {
    fontSize: '18px',
    color: '#5a7c5a',
    marginBottom: '30px',
    lineHeight: '1.6',
  },

  shortsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shortsVideo: {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    maxWidth: '100%',
    height: 'auto',
  },

  rulesContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  rulesVideo: {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    maxWidth: '100%',
    height: 'auto',
  },

  tipsSection: {
    display: 'flex',
    justifyContent: 'center',
  },

  tipsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
    width: '100%',
    maxWidth: '1000px',
  },

  tipsTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '30px',
    textAlign: 'center',
  },

  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },

  tipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fffe',
    borderRadius: '12px',
    border: '1px solid #e8f5e8',
    transition: 'all 0.3s ease',
  },

  tipIcon: {
    fontSize: '32px',
    width: '50px',
    height: '50px',
    backgroundColor: '#e8f5e8',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  tipContent: {
    flex: 1,
  },

  tipHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2d4a2f',
    marginBottom: '8px',
  },

  tipText: {
    fontSize: '14px',
    color: '#5a7c5a',
    lineHeight: '1.5',
    margin: 0,
  },

  ctaSection: {
    display: 'flex',
    justifyContent: 'center',
  },

  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '50px 40px',
    textAlign: 'center',
    maxWidth: '700px',
    width: '100%',
    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e8f5e8',
  },

  ctaTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d4a2f',
    marginBottom: '16px',
  },

  ctaText: {
    fontSize: '20px',
    color: '#5a7c5a',
    marginBottom: '32px',
    lineHeight: '1.6',
  },

  ctaButtons: {
    display: 'flex',
    gap: '20px',
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

// Add hover effects and responsive design
// Update the addGlobalStyles function:

const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .tip-item:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15) !important;
    }

    /* Updated responsive rules to allow taller videos */
    @media (max-width: 900px) {
      iframe {
        width: 100% !important;
        max-width: 560px !important;
        height: 315px !important;  /* Reduced only for mobile */
      }
    }

    @media (min-width: 901px) {
      /* Desktop: Keep the custom heights */
      .shorts-video {
        width: 400px !important;
        height: 700px !important;
      }
      
      .rules-video {
        width: 900px !important;
        height: 600px !important;
      }
    }

    @media (max-width: 600px) {
      .shorts-video {
        width: 280px !important;
        height: 500px !important;  /* Taller than before */
      }
      
      .tips-grid {
        grid-template-columns: 1fr !important;
      }
      
      .cta-buttons {
        flex-direction: column !important;
        align-items: center !important;
      }
    }

    /* Custom styling for embedded videos */
    iframe {
      transition: all 0.3s ease;
    }
    
    iframe:hover {
      transform: scale(1.02);
      box-shadow: 0 12px 32px rgba(0,0,0,0.2) !important;
    }
  `;
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  addGlobalStyles();
}

export default HowToPlay;
