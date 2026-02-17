import React from 'react';
import { User, UserRole } from '../types';
import GeneralUserLayout from '../components/HomeView/GeneralUserLayout';
import AdminLayout from '../components/HomeView/AdminLayout';

interface HomeViewProps {
  user: User;
  onNavigate: (tab: string) => void;
  onDirectNavigate?: (tab: string) => void;
  state?: any;
  correrias?: any[];
  correriasLoading?: boolean;
  correriasError?: any;
}

const HomeView: React.FC<HomeViewProps> = ({ user, onNavigate, onDirectNavigate, state, correrias, correriasLoading, correriasError }) => {
  // Render appropriate layout based on user role
  // Admin and Observer can see the admin dashboard
  if (user.role === UserRole.ADMIN || user.role === UserRole.OBSERVER) {
    return <AdminLayout user={user} onNavigate={onNavigate} onDirectNavigate={onDirectNavigate} state={state || {}} correrias={correrias || []} correriasLoading={correriasLoading || false} correriasError={correriasError} />;
  }

  return <GeneralUserLayout user={user} onNavigate={onNavigate} />;
};

export default HomeView;
