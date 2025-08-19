import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { SignOutButton } from '@clerk/clerk-react';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const linkClass = ({ isActive }) => ({
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: isActive ? "white" : "#2d4a2f",
    backgroundColor: isActive ? "#4a7a4a" : "rgba(255,255,255,0.1)",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: isActive ? "none" : "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    boxShadow: isActive ? "0 4px 12px rgba(74, 122, 74, 0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
    transform: isActive ? "translateY(-1px)" : "translateY(0)",
    fontSize: "14px",
    letterSpacing: "0.5px",
    display: "inline-block"
  });

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 32px', 
      background: 'linear-gradient(135deg, #8fc87a 0%, #7fb86a 50%, #6fa85a 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      borderRadius: "0 0 16px 16px",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)",
      position: "sticky",
      top: 0,
      overflow: "visible",
      width: "100%",
      boxSizing: "border-box",
      zIndex: 1000
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        pointerEvents: "none"
      }} />
      
      <div style={{ 
        fontSize: 28, 
        fontWeight: "800", 
        color: "#2d4a2f",
        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        letterSpacing: "-0.5px",
        position: "relative",
        zIndex: 1
      }}>
        <NavLink 
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit"
          }}
        >
          PicklePick
        </NavLink>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        alignItems: 'center',
        position: "relative",
        zIndex: 1
      }}>
        <NavLink to="/chats" style={linkClass}>Chats</NavLink>
        <NavLink to="/my-posts" style={linkClass}>My Posts</NavLink>
        
        {/* Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#2d4a2f",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div style={{
              position: "fixed",
              top: "calc(100% + 8px)",
              right: "32px",
              background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95))",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
              backdropFilter: "blur(20px)",
              minWidth: "140px",
              zIndex: 99999,
              overflow: "hidden"
            }}>
              <NavLink 
                to="/profile" 
                onClick={() => setIsDropdownOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  textDecoration: "none",
                  color: "#2d4a2f",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  borderBottom: "1px solid rgba(0,0,0,0.05)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(74, 122, 74, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Profile
                </span>
              </NavLink>
              
              <SignOutButton>
                <button 
                  onClick={() => setIsDropdownOpen(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    background: "transparent",
                    color: "#2d4a2f",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
                    e.currentTarget.style.color = "#dc3545";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#2d4a2f";
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Sign Out
                  </span>
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}