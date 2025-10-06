import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasHistory: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, hasHistory }) => {
  // Fix: Explicitly type NavButton as a React Functional Component.
  // This helps TypeScript correctly infer the `children` prop when the component is used.
  const NavButton: React.FC<{ view: AppView; children: React.ReactNode }> = ({ view, children }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
        }`}
        disabled={isActive}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔍</span>
            <h1 className="text-xl font-bold text-gray-800">Campus Lost & Found AI</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <NavButton view={AppView.FORM}>Report an Item</NavButton>
            {hasHistory && <NavButton view={AppView.HISTORY}>My Reports</NavButton>}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
