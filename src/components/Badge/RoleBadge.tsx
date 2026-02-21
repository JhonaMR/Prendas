import React from 'react';
import { UserRole } from '../../types';
import './RoleBadge.css';

interface RoleBadgeProps {
  role: UserRole | string;
  className?: string;
}

const roleConfig = {
  [UserRole.ADMIN]: {
    backgroundColor: 'bg-pink-500',
    label: 'Admin',
    show: true
  },
  [UserRole.OBSERVER]: {
    backgroundColor: 'bg-purple-500',
    label: 'Observador',
    show: true
  },
  [UserRole.GENERAL]: {
    backgroundColor: 'bg-blue-500',
    label: 'General',
    show: true
  },
  [UserRole.DISEÑADORA]: {
    backgroundColor: 'bg-green-400',
    label: 'Diseñadora',
    show: true
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  // Validate role
  if (!role) {
    console.warn('RoleBadge: role prop is required');
    return null;
  }

  const config = roleConfig[role as UserRole];

  if (!config) {
    console.warn(`RoleBadge: Unknown role "${role}". Valid roles are: ${Object.keys(UserRole).join(', ')}`);
    return null;
  }

  if (!config.show) {
    return null;
  }

  return (
    <div className={`absolute top-0 right-0 p-2 ${className}`}>
      <span className={`text-[8px] font-black ${config.backgroundColor} text-white px-3 py-1 rounded-bl-2xl uppercase tracking-widest`}>
        {config.label}
      </span>
    </div>
  );
};

export default RoleBadge;
