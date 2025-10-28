import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { trainerService, Customer } from '@/services/trainer';

export default function TrainerCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    if (!user?.user_id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const data = await trainerService.getMyCustomers(user.user_id);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading customers...</Text>
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
        <Text style={styles.title}>My Customers</Text>
      </View>

      <View style={styles.content}>
        {customers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers assigned yet</Text>
            <Text style={styles.emptySubText}>
              Customers will appear here once they are assigned to you
            </Text>
          </View>
        ) : (
          customers.map((customer) => {
            const customerName = customer.user.first_name && customer.user.last_name
              ? `${customer.user.first_name} ${customer.user.last_name}`
              : customer.user.email;

            return (
              <TouchableOpacity
                key={customer.user_id}
                style={styles.customerCard}
                onPress={() => router.push(`/trainer/customer-detail?id=${customer.user_id}&name=${customerName}&email=${customer.user.email}`)}
              >
                <View style={styles.customerHeader}>
                  <View>
                    <Text style={styles.customerName}>{customerName}</Text>
                    <Text style={styles.customerEmail}>{customer.user.email}</Text>
                    {customer.user.phone_number && (
                      <Text style={styles.customerPhone}>{customer.user.phone_number}</Text>
                    )}
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>ACTIVE</Text>
                  </View>
                </View>

                <View style={styles.customerStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>This Month</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>0</Text>
                    <Text style={styles.statLabel}>Total Sessions</Text>
                  </View>
                </View>

                <Text style={styles.viewDetailsText}>Tap to view details →</Text>
              </TouchableOpacity>
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
  customerPhone: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
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