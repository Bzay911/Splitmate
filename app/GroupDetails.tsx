import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const GroupDetails = () => {
  const { groupId, groupName, totalExpense, image } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: image as string }} 
          style={styles.groupImage}
        />
        <Text style={styles.groupName}>{groupName}</Text>
        <Text style={styles.totalExpense}>Total Expense: ${totalExpense}</Text>
      </View>
      
      {/* Add more group details here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalExpense: {
    fontSize: 18,
    color: '#666',
  },
});

export default GroupDetails;
