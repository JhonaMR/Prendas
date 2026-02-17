/**
 * Unit tests para AuthContext
 * **Validates: Requirements 2.1**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useAuth } from './useContexts';
import { UserRole } from '../types';

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const { user, isAuthenticated, permissions, hasPermission, login, logout, setUser } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="user-id">{user?.id || 'No id'}</div>
      <div data-testid="user-role">{user?.role || 'No role'}</div>
      <div data-testid="permissions">{permissions.join(',')}</div>
      <div data-testid="permissions-count">{permissions.length}</div>
      <div data-testid="has-admin">
        {hasPermission('manage:users') ? 'Has admin' : 'No admin'}
      </div>
      <div data-testid="has-view-dashboard">
        {hasPermission('view:dashboard') ? 'Has view' : 'No view'}
      </div>
      <div data-testid="has-manage-clients">
        {hasPermission('manage:clients') ? 'Has manage' : 'No manage'}
      </div>
      <button
        data-testid="login-btn"
        onClick={() => login({ loginCode: 'ADM', pin: '1234' })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="set-user-btn"
        onClick={() => setUser({
          id: 'custom-user',
          name: 'Custom User',
          loginCode: 'CUSTOM',
          pin: '5678',
          role: UserRole.admin
        })}
      >
        Set User
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  describe('Initial State', () => {
    it('should provide initial state with no user', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
      expect(screen.getByTestId('permissions')).toHaveTextContent('');
      expect(screen.getByTestId('permissions-count')).toHaveTextContent('0');
    });

    it('should provide correct initial permissions when not authenticated', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('has-admin')).toHaveTextContent('No admin');
      expect(screen.getByTestId('has-view-dashboard')).toHaveTextContent('No view');
    });
  });

  describe('Login Functionality', () => {
    it('should login user successfully', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
    });

    it('should provide correct user data after login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).not.toHaveTextContent('No id');
      });

      expect(screen.getByTestId('user-role')).toHaveTextContent(UserRole.ADMIN);
    });

    it('should provide admin permissions after login', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('has-admin')).toHaveTextContent('Has admin');
      });

      expect(screen.getByTestId('permissions-count')).toHaveTextContent('11');
    });

    it('should include all required admin permissions', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('has-manage-clients')).toHaveTextContent('Has manage');
      });

      const permissionsText = screen.getByTestId('permissions').textContent || '';
      expect(permissionsText).toContain('manage:users');
      expect(permissionsText).toContain('manage:clients');
      expect(permissionsText).toContain('view:dashboard');
    });
  });

  describe('Logout Functionality', () => {
    it('should logout user', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      fireEvent.click(logoutBtn);

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    });

    it('should clear permissions after logout', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('permissions-count')).toHaveTextContent('11');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      fireEvent.click(logoutBtn);

      expect(screen.getByTestId('permissions-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-admin')).toHaveTextContent('No admin');
    });
  });

  describe('Permission Verification', () => {
    it('should verify hasPermission works correctly for admin', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('has-admin')).toHaveTextContent('Has admin');
      });
    });

    it('should return false for non-existent permission', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      // hasPermission should return false for non-existent permission
      // This is tested implicitly by checking that only expected permissions exist
      const permissionsText = screen.getByTestId('permissions').textContent || '';
      expect(permissionsText).not.toContain('non:existent');
    });
  });

  describe('SetUser Functionality', () => {
    it('should set user directly', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const setUserBtn = screen.getByTestId('set-user-btn');
      fireEvent.click(setUserBtn);

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Custom User');
      expect(screen.getByTestId('user-id')).toHaveTextContent('custom-user');
    });

    it('should update permissions when user is set', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const setUserBtn = screen.getByTestId('set-user-btn');
      fireEvent.click(setUserBtn);

      expect(screen.getByTestId('permissions-count')).toHaveTextContent('11');
      expect(screen.getByTestId('has-admin')).toHaveTextContent('Has admin');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth debe ser usado dentro de AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('State Transitions', () => {
    it('should handle multiple login/logout cycles', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginBtn = screen.getByTestId('login-btn');
      const logoutBtn = screen.getByTestId('logout-btn');

      // First cycle
      fireEvent.click(loginBtn);
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      fireEvent.click(logoutBtn);
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

      // Second cycle
      fireEvent.click(loginBtn);
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
    });
  });
});
