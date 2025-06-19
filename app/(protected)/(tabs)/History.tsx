import { useActivity } from '@/contexts/ActivityContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const History = () => {

  const {activities, isLoading, error, refreshActivities} = useActivity();

  const renderActivity = ({item}: {item: any}) => {
    // Add null check for item
    if (!item) {
      console.log('Item is undefined');
      return null;
    }

    return (
      <View style={styles.activityItem}>
        <View style={styles.activity}>
          <Ionicons name="time-outline" size={24} color="white" />
          <View style={styles.activityContent}>
            <Text style={styles.activityMessage} numberOfLines={3} ellipsizeMode="tail">
              {item.message || 'No activity'}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'No date'}
              {" at "}
              {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : 'No time'}
            </Text>
          </View>
        </View>
      </View>
    )
  }

   // Show loading state
   if (isLoading && activities.length === 0) {
    return (
      <LinearGradient
        colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
        style={styles.safeAreaView}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.topSection}>
            <Text style={styles.topBarTitle}>Activity</Text>
          </View>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#fccc28" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

     // Show empty state
  if (activities.length === 0) {
    return (
      <LinearGradient
        colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
        style={styles.safeAreaView}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.topSection}>
            <Text style={styles.topBarTitle}>Activity</Text>
          </View>
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No activities yet</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
      style={styles.safeAreaView}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.topSection}>
          <Text style={styles.topBarTitle}>Activity</Text>
        </View>
        <FlatList 
          data={activities}
          renderItem={renderActivity}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshActivities}
              tintColor="#fccc28"
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
    </LinearGradient>
  );
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
    color: "white",
    marginBottom: 8,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityMessage: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,  
    fontWeight: "500",
    flexWrap: 'wrap',
  },
  activityTimestamp: {
    fontSize: 12,
    color: 'white',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  activityItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  activity: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    flexWrap: 'wrap',
  },
})

export default History