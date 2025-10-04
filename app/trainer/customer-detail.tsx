import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function CustomerDetail() {
  const { id, name, email } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const currentYear = new Date().getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = [currentYear, currentYear + 1, currentYear - 1, currentYear - 2];

  const [newSession, setNewSession] = useState({
    month: months[new Date().getMonth()],
    year: currentYear.toString(),
    sessionVolume: '',
    notes: '',
    sessionPlan: '',
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      month: 'January',
      year: '2025',
      sessionVolume: 8,
      notes: 'Client showing good progress with strength training. Focus on form improvement.',
      sessionPlan: 'Week 1-2: Upper body focus\nWeek 3-4: Lower body and core\nCardio: 20 min warm-up each session',
    },
    {
      id: 2,
      month: 'December',
      year: '2024',
      sessionVolume: 10,
      notes: 'Completed all sessions. Great consistency. Ready to increase intensity.',
      sessionPlan: 'Progressive overload on main lifts\nIntroduced HIIT cardio\nFlexibility work added',
    },
    {
      id: 3,
      month: 'November',
      year: '2024',
      sessionVolume: 12,
      notes: 'Started with basic conditioning. Built good foundation.',
      sessionPlan: 'Foundation building phase\nFocus on proper form\nGradual intensity increase',
    },
  ]);

  const handleAddSession = () => {
    if (newSession.month && newSession.year && newSession.sessionVolume) {
      const session = {
        id: sessions.length + 1,
        ...newSession,
        sessionVolume: parseInt(newSession.sessionVolume),
      };
      setSessions([session, ...sessions]);
      setNewSession({
        month: months[new Date().getMonth()],
        year: currentYear.toString(),
        sessionVolume: '',
        notes: '',
        sessionPlan: '',
      });
      setModalVisible(false);
      setShowMonthDropdown(false);
      setShowYearDropdown(false);
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

        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionMonth}>{session.month} {session.year}</Text>
              <View style={styles.volumeBadge}>
                <Text style={styles.volumeText}>{session.sessionVolume} sessions</Text>
              </View>
            </View>

            <View style={styles.sessionContent}>
              <Text style={styles.fieldLabel}>Session Notes:</Text>
              <Text style={styles.fieldContent}>{session.notes}</Text>

              <Text style={styles.fieldLabel}>Session Plan:</Text>
              <Text style={styles.fieldContent}>{session.sessionPlan}</Text>
            </View>
          </View>
        ))}
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

            <View style={styles.inputRow}>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[styles.input, styles.halfInput, styles.dropdownButton]}
                  onPress={() => {
                    setShowMonthDropdown(!showMonthDropdown);
                    setShowYearDropdown(false);
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

              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[styles.input, styles.halfInput, styles.dropdownButton]}
                  onPress={() => {
                    setShowYearDropdown(!showYearDropdown);
                    setShowMonthDropdown(false);
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

            <TextInput
              style={styles.input}
              placeholder="Session Volume (number of sessions)"
              value={newSession.sessionVolume}
              onChangeText={(text) => setNewSession({...newSession, sessionVolume: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Previous Session Notes"
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setShowMonthDropdown(false);
                  setShowYearDropdown(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddSession}
              >
                <Text style={styles.saveButtonText}>Save Session</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  volumeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  volumeText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
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
});