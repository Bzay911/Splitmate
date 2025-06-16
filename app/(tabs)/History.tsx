import { useActivity } from '@/contexts/ActivityContext';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const History = () => {

  const {activities, isLoading, error, refreshActivities} = useActivity();

  const renderActivity = ({item}) => {
    // Add null check for item
    if (!item) {
      console.log('Item is undefined');
      return null;
    }

    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityMessage}>{item.message || 'No activity'}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) : 'No date'}
           {""} at{" "}
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : 'No time'}
        </Text>
      </View>
    )
  }

   // Show loading state
   if (isLoading && activities.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.topSection}>
          <Text style={styles.topBarTitle}>Activity</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#64748b" />
        </View>
      </SafeAreaView>
    );
  }

     // Show empty state
  if (activities.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.topSection}>
          <Text style={styles.topBarTitle}>Activity</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No activities yet</Text>
        </View>
      </SafeAreaView>
    );
  }
   return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topSection}>
        <Text style={styles.topBarTitle}>Activity</Text>
      </View>
      <FlatList 
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshActivities}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No activities found</Text>
          </View>
        }
      />
    </SafeAreaView>
  )

  
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  topBarTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    fontWeight: "500",
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  activityItem: {
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
})

export default History