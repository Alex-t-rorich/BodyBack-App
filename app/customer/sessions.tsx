import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { sessionVolumeService, SessionVolume } from '@/services/sessionVolume';

export default function CustomerSessions() {
  const [sessions, setSessions] = useState<SessionVolume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      // Fetch session volumes for the current customer
      // The API will automatically filter to show only this customer's volumes
      const volumes = await sessionVolumeService.getSessionVolumes();
      setSessions(volumes);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load session volumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      await sessionVolumeService.approveSessionVolume(id);
      Alert.alert('Success', 'Session volume approved successfully');
      // Reload sessions to get updated status
      await loadSessions();
    } catch (error: any) {
      console.error('Error approving session:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to approve session volume'
      );
    } finally {
      setApprovingId(null);
    }
  };

  const formatPeriod = (period: string) => {
    const date = new Date(period);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'read':
        return { text: 'Pending Approval', color: '#FF9800' };
      case 'approved':
        return { text: '✓ Approved', color: '#4CAF50' };
      case 'rejected':
        return { text: '✗ Rejected', color: '#f44336' };
      case 'draft':
        return { text: 'Draft', color: '#9E9E9E' };
      default:
        return { text: status, color: '#9E9E9E' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Session Volumes</Text>
      </View>

      <View style={styles.content}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No session volumes yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your trainer will create session volumes for you to review
            </Text>
          </View>
        ) : (
          sessions.map((session) => {
            const statusDisplay = getStatusDisplay(session.status);
            const canApprove = session.status === 'submitted' || session.status === 'read';
            const isApproving = approvingId === session.id;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.monthText}>{formatPeriod(session.period)}</Text>
                  <View style={styles.sessionCountBox}>
                    <Text style={styles.sessionCountLabel}>Sessions</Text>
                    <Text style={styles.sessionCount}>{session.session_count}</Text>
                  </View>
                </View>

                {session.trainer && (
                  <Text style={styles.trainerText}>
                    Trainer: {session.trainer.first_name} {session.trainer.last_name}
                  </Text>
                )}

                {canApprove ? (
                  <TouchableOpacity
                    style={[styles.approveButton, isApproving && styles.approveButtonDisabled]}
                    onPress={() => handleApprove(session.id)}
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.approveButtonText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: statusDisplay.color + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusIndicatorText,
                        { color: statusDisplay.color },
                      ]}
                    >
                      {statusDisplay.text}
                    </Text>
                  </View>
                )}

                {(session.notes || session.plans) && (
                  <View style={styles.sessionDetailsPreview}>
                    {session.plans && (
                      <>
                        <Text style={styles.previewLabel}>Session Plan:</Text>
                        <Text style={styles.previewText}>{session.plans}</Text>
                      </>
                    )}
                    {session.notes && (
                      <>
                        <Text style={styles.previewLabel}>Trainer Notes:</Text>
                        <Text style={styles.previewText}>{session.notes}</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sessionCountBox: {
    alignItems: 'center',
  },
  sessionCountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sessionCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  trainerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  approveButtonDisabled: {
    opacity: 0.6,
  },
  approveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statusIndicator: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicatorText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sessionDetailsPreview: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});