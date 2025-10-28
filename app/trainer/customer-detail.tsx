import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SessionVolumeStatus, sessionVolumeService, SessionVolume } from '@/services/sessionVolume';

export default function CustomerDetail() {
  const { id, name, email } = useLocalSearchParams();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionVolume | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [showEditStatusDropdown, setShowEditStatusDropdown] = useState(false);
  const [editedSession, setEditedSession] = useState<{
    session_count: string;
    notes: string;
    plans: string;
    status: SessionVolumeStatus;
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = [currentYear, currentYear + 1, currentYear - 1, currentYear - 2];
  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'read', label: 'Read' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Trainer can only set: draft, submitted, or back to draft from rejected
  const trainerAllowedStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
  ];

  const [newSession, setNewSession] = useState({
    month: months[new Date().getMonth()],
    year: currentYear.toString(),
    sessionVolume: '',
    notes: '',
    sessionPlan: '',
    status: 'draft' as 'draft' | 'submitted' | 'read' | 'approved' | 'rejected',
  });

  const [sessions, setSessions] = useState<SessionVolume[]>([]);

  useEffect(() => {
    loadSessions();
  }, [id]);

  const loadSessions = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid customer ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await sessionVolumeService.getSessionVolumesByCustomer(id);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert month name and year to YYYY-MM-DD format
  const monthYearToDate = (monthName: string, year: string): string => {
    const monthIndex = months.indexOf(monthName);
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
  };

  // Helper function to convert YYYY-MM-DD to month name and year
  const dateToMonthYear = (dateString: string): { month: string; year: string } => {
    const date = new Date(dateString);
    return {
      month: months[date.getMonth()],
      year: date.getFullYear().toString(),
    };
  };

  // Helper function to get status badge styles
  const getStatusStyle = (status: SessionVolumeStatus) => {
    switch (status) {
      case 'draft':
        return {
          badge: { backgroundColor: '#f5f5f5' },
          text: { color: '#666' },
        };
      case 'submitted':
        return {
          badge: { backgroundColor: '#e3f2fd' },
          text: { color: '#2196F3' },
        };
      case 'read':
        return {
          badge: { backgroundColor: '#f3e5f5' },
          text: { color: '#9c27b0' },
        };
      case 'approved':
        return {
          badge: { backgroundColor: '#e8f5e9' },
          text: { color: '#4CAF50' },
        };
      case 'rejected':
        return {
          badge: { backgroundColor: '#ffebee' },
          text: { color: '#f44336' },
        };
      default:
        return {
          badge: { backgroundColor: '#f5f5f5' },
          text: { color: '#666' },
        };
    }
  };

  const handleSessionClick = (session: SessionVolume) => {
    setSelectedSession(session);
    setEditedSession({
      session_count: session.session_count.toString(),
      notes: session.notes || '',
      plans: session.plans || '',
      status: session.status,
    });
    setViewModalVisible(true);
  };

  const handleSaveSession = async () => {
    if (!selectedSession || !editedSession) return;

    // Check if status is not draft/rejected and trying to edit
    if (selectedSession.status !== 'draft' && selectedSession.status !== 'rejected') {
      Alert.alert('Error', 'Cannot edit sessions that have been submitted');
      return;
    }

    // Validate that all fields are filled if status is 'submitted'
    if (editedSession.status === 'submitted') {
      const sessionCount = parseInt(editedSession.session_count);

      if (!sessionCount || sessionCount <= 0) {
        Alert.alert('Validation Error', 'Session volume must be greater than 0 to submit');
        return;
      }

      if (!editedSession.notes || editedSession.notes.trim() === '') {
        Alert.alert('Validation Error', 'Session notes are required before submitting');
        return;
      }

      if (!editedSession.plans || editedSession.plans.trim() === '') {
        Alert.alert('Validation Error', 'Session plan is required before submitting');
        return;
      }
    }

    try {
      setIsSaving(true);

      await sessionVolumeService.updateSessionVolume(selectedSession.id, {
        session_count: parseInt(editedSession.session_count),
        notes: editedSession.notes || undefined,
        plans: editedSession.plans || undefined,
        status: editedSession.status,
      });

      // Reload sessions
      await loadSessions();

      // Close modal
      setViewModalVisible(false);
      setSelectedSession(null);
      setEditedSession(null);
      setShowEditStatusDropdown(false);

      Alert.alert('Success', 'Session updated successfully');
    } catch (error: any) {
      console.error('Error updating session:', error);

      if (error.response?.status === 400) {
        Alert.alert('Error', 'Cannot update sessions that have been submitted or approved');
      } else {
        Alert.alert('Error', 'Failed to update session. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSession = async () => {
    if (!user?.user_id || !id || typeof id !== 'string') {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    if (!newSession.month || !newSession.year || !newSession.sessionVolume) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate that all fields are filled if status is 'submitted'
    if (newSession.status === 'submitted') {
      const sessionCount = parseInt(newSession.sessionVolume);

      if (!sessionCount || sessionCount <= 0) {
        Alert.alert('Validation Error', 'Session volume must be greater than 0 to submit');
        return;
      }

      if (!newSession.notes || newSession.notes.trim() === '') {
        Alert.alert('Validation Error', 'Session notes are required before submitting');
        return;
      }

      if (!newSession.sessionPlan || newSession.sessionPlan.trim() === '') {
        Alert.alert('Validation Error', 'Session plan is required before submitting');
        return;
      }
    }

    try {
      setIsSaving(true);

      // Convert month/year to date format
      const period = monthYearToDate(newSession.month, newSession.year);

      // Create session volume via API
      await sessionVolumeService.createSessionVolume({
        trainer_id: user.user_id,
        customer_id: id,
        period: period,
        session_count: parseInt(newSession.sessionVolume),
        plans: newSession.sessionPlan || undefined,
        notes: newSession.notes || undefined,
        status: newSession.status,
      });

      // Reload sessions
      await loadSessions();

      // Reset form and close modal
      setNewSession({
        month: months[new Date().getMonth()],
        year: currentYear.toString(),
        sessionVolume: '',
        notes: '',
        sessionPlan: '',
        status: 'draft',
      });
      setModalVisible(false);
      setShowMonthDropdown(false);
      setShowYearDropdown(false);
      setShowStatusDropdown(false);

      Alert.alert('Success', 'Session volume added successfully');
    } catch (error: any) {
      console.error('Error adding session:', error);

      // Handle duplicate period error
      if (error.response?.status === 409) {
        Alert.alert('Error', 'A session volume already exists for this month. Please choose a different month.');
      } else {
        Alert.alert('Error', 'Failed to add session volume. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
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
        <Text style={styles.title}>Customer Details</Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{name}</Text>
        <Text style={styles.customerEmail}>{email}</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Session</Text>
      </TouchableOpacity>

      <View style={styles.sessionsContainer}>
        <Text style={styles.sectionTitle}>Session History</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubText}>Add a new session to get started</Text>
          </View>
        ) : (
          sessions.map((session) => {
            const { month, year } = dateToMonthYear(session.period);
            const statusLabel = statuses.find(s => s.value === session.status)?.label || 'Draft';
            const statusStyle = getStatusStyle(session.status);

            return (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => handleSessionClick(session)}
                activeOpacity={0.7}
              >
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionMonth}>{month} {year}</Text>
                    <View style={[styles.statusBadge, statusStyle.badge]}>
                      <Text style={[styles.statusText, statusStyle.text]}>{statusLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    <View style={styles.volumeBadge}>
                      <Text style={styles.volumeText}>{session.session_count} sessions</Text>
                    </View>
                    {(session.status === 'draft' || session.status === 'rejected') && (
                      <Text style={styles.editableIndicator}>Tap to edit</Text>
                    )}
                  </View>
                </View>

                <View style={styles.sessionContent}>
                  {session.notes && (
                    <>
                      <Text style={styles.fieldLabel}>Session Notes:</Text>
                      <Text style={styles.fieldContent}>{session.notes}</Text>
                    </>
                  )}

                  {session.plans && (
                    <>
                      <Text style={styles.fieldLabel}>Session Plan:</Text>
                      <Text style={styles.fieldContent}>{session.plans}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Session</Text>

            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.dropdownContainer, { zIndex: 10 }]}>
                <Text style={styles.fieldLabelTop}>Status:</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton, { marginBottom: 15 }]}
                  onPress={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {statuses.find(s => s.value === newSession.status)?.label || 'Draft'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {showStatusDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScrollView}>
                      {trainerAllowedStatuses.map((status) => (
                        <TouchableOpacity
                          key={status.value}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewSession({...newSession, status: status.value as SessionVolumeStatus});
                            setShowStatusDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            newSession.status === status.value && styles.selectedItemText
                          ]}>
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={[styles.inputRowWrapper, { marginTop: 0 }]}>
              <View style={styles.inputRow}>
                <View style={[styles.dropdownContainer, { zIndex: 3 }]}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.dropdownButton]}
                    onPress={() => {
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>{newSession.month}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>

                  {showMonthDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScrollView}>
                        {months.map((month) => (
                          <TouchableOpacity
                            key={month}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewSession({...newSession, month});
                              setShowMonthDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              newSession.month === month && styles.selectedItemText
                            ]}>
                              {month}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={[styles.dropdownContainer, { zIndex: 2 }]}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.dropdownButton]}
                    onPress={() => {
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>{newSession.year}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>

                  {showYearDropdown && (
                    <View style={[styles.dropdownList, styles.yearDropdownList]}>
                      {years.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewSession({...newSession, year: year.toString()});
                            setShowYearDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            newSession.year === year.toString() && styles.selectedItemText
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Session Volume (number of sessions)"
              value={newSession.sessionVolume}
              onChangeText={(text) => setNewSession({...newSession, sessionVolume: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Session Notes"
              value={newSession.notes}
              onChangeText={(text) => setNewSession({...newSession, notes: text})}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Session Plan"
              value={newSession.sessionPlan}
              onChangeText={(text) => setNewSession({...newSession, sessionPlan: text})}
              multiline
              numberOfLines={4}
            />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setShowMonthDropdown(false);
                  setShowYearDropdown(false);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleAddSession}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Session</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View/Edit Session Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => {
          setViewModalVisible(false);
          setSelectedSession(null);
          setShowEditStatusDropdown(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedSession && (
              <>
                <Text style={styles.modalTitle}>
                  {dateToMonthYear(selectedSession.period).month} {dateToMonthYear(selectedSession.period).year}
                </Text>

                <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                  {editedSession && (
                    <>
                      {/* Show editable fields if draft or rejected */}
                      {(selectedSession.status === 'draft' || selectedSession.status === 'rejected') ? (
                        <>
                          <View style={[styles.dropdownContainer, { zIndex: 10 }]}>
                            <Text style={styles.fieldLabelTop}>Status:</Text>
                            <TouchableOpacity
                              style={[styles.input, styles.dropdownButton, { marginBottom: 15 }]}
                              onPress={() => setShowEditStatusDropdown(!showEditStatusDropdown)}
                            >
                              <Text style={styles.dropdownButtonText}>
                                {trainerAllowedStatuses.find(s => s.value === editedSession.status)?.label || 'Draft'}
                              </Text>
                              <Text style={styles.dropdownArrow}>▼</Text>
                            </TouchableOpacity>

                            {showEditStatusDropdown && (
                              <View style={styles.dropdownList}>
                                <ScrollView style={styles.dropdownScrollView}>
                                  {trainerAllowedStatuses.map((status) => (
                                    <TouchableOpacity
                                      key={status.value}
                                      style={styles.dropdownItem}
                                      onPress={() => {
                                        setEditedSession({...editedSession, status: status.value as SessionVolumeStatus});
                                        setShowEditStatusDropdown(false);
                                      }}
                                    >
                                      <Text style={[
                                        styles.dropdownItemText,
                                        editedSession.status === status.value && styles.selectedItemText
                                      ]}>
                                        {status.label}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              </View>
                            )}
                          </View>

                          <TextInput
                            style={styles.input}
                            placeholder="Session Volume (number of sessions)"
                            value={editedSession.session_count}
                            onChangeText={(text) => setEditedSession({...editedSession, session_count: text})}
                            keyboardType="numeric"
                          />

                          <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Session Notes"
                            value={editedSession.notes}
                            onChangeText={(text) => setEditedSession({...editedSession, notes: text})}
                            multiline
                            numberOfLines={3}
                          />

                          <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Session Plan"
                            value={editedSession.plans}
                            onChangeText={(text) => setEditedSession({...editedSession, plans: text})}
                            multiline
                            numberOfLines={4}
                          />
                        </>
                      ) : (
                        <>
                          {/* Read-only view for submitted/approved sessions */}
                          <View style={styles.viewField}>
                            <Text style={styles.viewFieldLabel}>Session Volume:</Text>
                            <Text style={styles.viewFieldValue}>{selectedSession.session_count} sessions</Text>
                          </View>

                          {selectedSession.notes && (
                            <View style={styles.viewField}>
                              <Text style={styles.viewFieldLabel}>Session Notes:</Text>
                              <Text style={styles.viewFieldValue}>{selectedSession.notes}</Text>
                            </View>
                          )}

                          {selectedSession.plans && (
                            <View style={styles.viewField}>
                              <Text style={styles.viewFieldLabel}>Session Plan:</Text>
                              <Text style={styles.viewFieldValue}>{selectedSession.plans}</Text>
                            </View>
                          )}

                          <View style={styles.viewField}>
                            <Text style={styles.viewFieldLabel}>Status:</Text>
                            <Text style={styles.viewFieldValue}>
                              {statuses.find(s => s.value === selectedSession.status)?.label || 'Draft'}
                            </Text>
                          </View>
                        </>
                      )}
                    </>
                  )}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setViewModalVisible(false);
                      setSelectedSession(null);
                      setEditedSession(null);
                      setShowEditStatusDropdown(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>

                  {/* Show Save button only for draft/rejected sessions */}
                  {(selectedSession.status === 'draft' || selectedSession.status === 'rejected') && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton, isSaving && styles.disabledButton]}
                      onPress={handleSaveSession}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
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
  customerInfo: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  customerEmail: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sessionMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  volumeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 4,
  },
  volumeText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  editableIndicator: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  sessionContent: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  fieldContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formScrollView: {
    maxHeight: '75%',
    marginBottom: 15,
  },
  inputRowWrapper: {
    zIndex: 10,
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  yearDropdownList: {
    maxHeight: 150,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  viewField: {
    marginBottom: 20,
  },
  viewFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  viewFieldValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldLabelTop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
});