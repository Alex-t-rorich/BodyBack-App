import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

export default function TrainerCustomers() {
  const customers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      sessionsThisMonth: 6,
      totalSessions: 48,
      status: 'active',
    },
    {
      id: 2,
      name: 'Mike Wilson',
      email: 'mike.w@email.com',
      sessionsThisMonth: 8,
      totalSessions: 72,
      status: 'active',
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      sessionsThisMonth: 4,
      totalSessions: 36,
      status: 'active',
    },
    {
      id: 4,
      name: 'James Brown',
      email: 'james.b@email.com',
      sessionsThisMonth: 0,
      totalSessions: 24,
      status: 'inactive',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      sessionsThisMonth: 10,
      totalSessions: 120,
      status: 'active',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Customers</Text>
      </View>

      <View style={styles.content}>
        {customers.map((customer) => (
          <TouchableOpacity
            key={customer.id}
            style={styles.customerCard}
            onPress={() => router.push(`/trainer/customer-detail?id=${customer.id}&name=${customer.name}&email=${customer.email}`)}
          >
            <View style={styles.customerHeader}>
              <View>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerEmail}>{customer.email}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                customer.status === 'active' ? styles.activeBadge : styles.inactiveBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  customer.status === 'active' ? styles.activeText : styles.inactiveText
                ]}>
                  {customer.status}
                </Text>
              </View>
            </View>

            <View style={styles.customerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{customer.sessionsThisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{customer.totalSessions}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
            </View>

            <Text style={styles.viewDetailsText}>Tap to view details →</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#e8f5e9',
  },
  inactiveBadge: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#f44336',
  },
  customerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
  },
});