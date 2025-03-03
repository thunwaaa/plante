import React, { useState, useRef, useEffect } from 'react';

export const Auth = () => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const containerRef = useRef(null);
  const signinButtonRef = useRef(null);
  const signupButtonRef = useRef(null);

  // Function to determine which button the mouse is over
  const checkButtonHover = (x, y) => {
    if (!signinButtonRef.current || !signupButtonRef.current) return null;
    
    const signinRect = signinButtonRef.current.getBoundingClientRect();
    const signupRect = signupButtonRef.current.getBoundingClientRect();
    
    // Check if point is inside any button
    if (x >= signinRect.left && x <= signinRect.right && 
        y >= signinRect.top && y <= signinRect.bottom) {
      return 'signin';
    } else if (x >= signupRect.left && x <= signupRect.right && 
               y >= signupRect.top && y <= signupRect.bottom) {
      return 'signup';
    }
    
    return null;
  };

  // Handle mouse movement within the container
  const handleMouseMove = (e) => {
    const hovering = checkButtonHover(e.clientX, e.clientY);
    if (hovering !== hoveredButton) {
      setHoveredButton(hovering);
    }
  };

  // Clear the hover state when mouse leaves the container
  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  // Get appropriate styles based on hover state
  const getButtonStyles = (buttonType) => {
    if (hoveredButton === null) {
      // Default state - "Sign in" is light, "Sign up" is dark
      return buttonType === 'signin' 
        ? 'border-[#373E11] text-[#373E11] bg-[#E6E4BB]' 
        : 'bg-[#373E11] text-[#E6E4BB]';
    } else if (hoveredButton === buttonType) {
      // Current button is hovered - applies the dark style
      return 'bg-[#373E11] text-[#E6E4BB]';
    } else {
      // Other button (not hovered) - applies the light style
      return 'border-[#373E11] text-[#373E11] bg-[#E6E4BB]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex text-xl items-center p-2 mt-[-46px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        ref={signinButtonRef}
        className={`
          mr-4 p-2 border border-[#373E11] rounded-3xl w-24 transition duration-300
          ${getButtonStyles('signin')}
        `}
      >
        <a href="/">Sign in</a>
      </button>
      <button 
        ref={signupButtonRef}
        className={`
          mr-2 p-2 border border-[#373E11] rounded-3xl w-24 transition duration-300
          ${getButtonStyles('signup')}
        `}
      >
        <a href="/">Sign up</a>
      </button>
    </div>
  );
};

export default Auth;