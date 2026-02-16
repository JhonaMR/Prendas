import React from 'react';
import { User, UserRole } from '../types';
import GeneralUserLayout from '../components/HomeView/GeneralUserLayout';
import AdminLayout from '../components/HomeView/AdminLayout';

interface HomeViewProps {
  user: User;
  onNavigate: (tab: string) => void;
  state?: any;
  correrias?: any[];
  correriasLoading?: boolean;
  correriasError?: any;
}

const HomeView: React.FC<HomeViewProps> = ({ user, onNavigate, state, correrias, correriasLoading, correriasError }) => {
  // Render appropriate layout based on user role
  if (user.role === UserRole.admin) {
    return <AdminLayout user={user} onNavigate={onNavigate} state={state || {}} correrias={correrias || []} correriasLoading={correriasLoading || false} correriasError={correriasError} />;
  }

  return <GeneralUserLayout user={user} onNavigate={onNavigate} />;
};

export default HomeView;
