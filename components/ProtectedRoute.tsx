import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.replace('/');
        return;
      }

      // If role restrictions are specified, check if user has correct role
      if (allowedRoles && allowedRoles.length > 0 && user) {
        const userRole = user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
          // User doesn't have permission, redirect to appropriate dashboard
          if (userRole === 'customer') {
            router.replace('/customer/dashboard');
          } else if (userRole === 'trainer') {
            router.replace('/trainer/dashboard');
          } else {
            router.replace('/');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
