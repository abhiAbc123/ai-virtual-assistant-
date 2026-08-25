import React, { useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { Plus, LogOut } from 'lucide-react';

export const ProfileDropdown = ({
  isOpen,
  onClose,
  onCreateCustom,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const { audioFx } = useAssistant();
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.name || 'avijit';
  const displayEmail = user?.email || 'abc1234@gmail.com';
  const initial = displayName.charAt(0).toUpperCase() || 'A';

  const handleCreateCustom = () => {
    if (audioFx?.playClick) audioFx.playClick();
    onClose();
    if (onCreateCustom) {
      onCreateCustom();
    } else if (onOpenSettings) {
      onOpenSettings();
    }
  };

  const handleSignOut = () => {
    if (audioFx?.playClick) audioFx.playClick();
    onClose();
    logout();
  };

  return (
    <>
      {/* Backdrop overlay for outside click */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Profile Dropdown Card */}
      <div
        ref={dropdownRef}
        className="profile-dropdown animate-fadeIn select-none"
      >
        {/* 1. Profile Information */}
        <div className="profile-info">
          {/* Avatar */}
          <div className="profile-avatar bg-blue-600 text-white font-extrabold text-2xl shadow-sm">
            {initial}
          </div>

          {/* Name + Email */}
          <div className="profile-details">
            <div className="profile-name">
              {displayName}
            </div>
            <div className="profile-email">
              {displayEmail}
            </div>
          </div>
        </div>

        {/* 2. Active Session Pill */}
        <div className="profile-status">
          <span className="profile-status-dot animate-pulse" />
          <span>Active Session • Ready</span>
        </div>

        {/* 3. Menu Actions */}
        <div className="profile-menu">
          {/* Create Custom Assistant */}
          <button
            type="button"
            onClick={handleCreateCustom}
            className="profile-menu-item"
          >
            <div className="profile-menu-icon text-blue-600">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>Create Custom Assistant</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="profile-menu-item danger"
          >
            <div className="profile-menu-icon text-red-500">
              <LogOut className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
