import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityContextType {
  fontSize: 'normal' | 'large' | 'extra-large';
  increaseFontSize: () => void;
  resetFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  const increaseFontSize = () => {
    setFontSize(current => {
      if (current === 'normal') return 'large';
      if (current === 'large') return 'extra-large';
      return 'normal';
    });
  };

  const resetFontSize = () => setFontSize('normal');

  return (
    <AccessibilityContext.Provider value={{ fontSize, increaseFontSize, resetFontSize }}>
      <div className={`${fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-xl' : ''}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};