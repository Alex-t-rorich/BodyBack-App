import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

export default function CustomerSessions() {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      month: 'January 2025',
      sessionCount: 8,
      status: 'pending',
      notes: 'Client showing good progress with strength training. Focus on form improvement.',
      sessionPlan: 'Week 1-2: Upper body focus\nWeek 3-4: Lower body and core\nCardio: 20 min warm-up each session',
    },
    {
      id: 2,
      month: 'December 2024',
      sessionCount: 10,
      status: 'approved',
      notes: 'Completed all sessions. Great consistency. Ready to increase intensity.',
      sessionPlan: 'Progressive overload on main lifts\nIntroduced HIIT cardio\nFlexibility work added',
    },
    {
      id: 3,
      month: 'November 2024',
      sessionCount: 12,
      status: 'disapproved',
      notes: 'Started with basic conditioning. Built good foundation.',
      sessionPlan: 'Foundation building phase\nFocus on proper form\nGradual intensity increase',
    },
    {
      id: 4,
      month: 'October 2024',
      sessionCount: 9,
      status: 'approved',
      notes: 'Initial assessment completed. Established baseline metrics.',
      sessionPlan: 'Assessment week\nIntroductory workouts\nMobility focus',
    },
  ]);

  const handleApprove = (id: number) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, status: 'approved' } : session
    ));
  };

  const handleDisapprove = (id: number) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, status: 'disapproved' } : session
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Session History</Text>
      </View>

      <View style={styles.content}>
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <Text style={styles.monthText}>{session.month}</Text>
              <View style={styles.sessionCountBox}>
                <Text style={styles.sessionCountLabel}>Sessions</Text>
                <Text style={styles.sessionCount}>{session.sessionCount}</Text>
              </View>
            </View>

            {session.status === 'pending' ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(session.id)}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.disapproveButton]}
                  onPress={() => handleDisapprove(session.id)}
                >
                  <Text style={styles.disapproveButtonText}>Disapprove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[
                styles.statusIndicator,
                session.status === 'approved' ? styles.approvedStatus : styles.disapprovedStatus
              ]}>
                <Text style={[
                  styles.statusIndicatorText,
                  session.status === 'approved' ? styles.approvedText : styles.disapprovedText
                ]}>
                  {session.status === 'approved' ? '✓ Approved' : '✗ Disapproved'}
                </Text>
              </View>
            )}

            {(session.notes || session.sessionPlan) && (
              <View style={styles.sessionDetailsPreview}>
                {session.notes && (
                  <>
                    <Text style={styles.previewLabel}>Trainer Notes:</Text>
                    <Text style={styles.previewText}>{session.notes}</Text>
                  </>
                )}
                {session.sessionPlan && (
                  <>
                    <Text style={styles.previewLabel}>Session Plan:</Text>
                    <Text style={styles.previewText}>{session.sessionPlan}</Text>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  disapproveButton: {
    backgroundColor: '#f44336',
  },
  approveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disapproveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statusIndicator: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  approvedStatus: {
    backgroundColor: '#e8f5e9',
  },
  disapprovedStatus: {
    backgroundColor: '#ffebee',
  },
  statusIndicatorText: {
    fontWeight: '600',
  },
  approvedText: {
    color: '#4CAF50',
  },
  disapprovedText: {
    color: '#f44336',
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