import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const SettleUp = () => {
  const { user } = useAuth();
  const username = user?.displayName;
  const { settlements } = useLocalSearchParams();
  const parsedSettlements = settlements ? JSON.parse(settlements as string) : [];

  const handleSettlementPress = (settlement: { from: string; to: string; amount: number }) => {
    const isPayment = settlement.from === username;
    const message = isPayment 
      ? `Mark payment of $${settlement.amount.toFixed(2)} to ${settlement.to} as settled?`
      : `Mark payment of $${settlement.amount.toFixed(2)} from ${settlement.from} as settled?`;

    Alert.alert(
      'Settle Payment',
      message,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Handle the settlement confirmation here
            console.log('Settlement confirmed:', settlement);
            // You can add your settlement logic here
          },
        },
      ]
    );
  };

  const renderSettlementItem = ({ item }: { item: { from: string; to: string; amount: number } }) => {
    const isPayment = item.from === username;
    const isReceiving = item.to === username;
    
    if (!isPayment && !isReceiving) return null;

    const settlementText = isPayment 
      ? `You need to pay $${item.amount.toFixed(2)} to ${item.to}`
      : `${item.from} needs to pay you $${item.amount.toFixed(2)}`;

    return (
      <TouchableOpacity 
        style={styles.settlementItem}
        onPress={() => handleSettlementPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.settlementText}>{settlementText}</Text>
      </TouchableOpacity>
    );
  };

  const filteredSettlements = parsedSettlements.filter((settlement: { from: string; to: string; amount: number }) => 
    settlement.from === username || settlement.to === username
  );

  return (
    <LinearGradient
      colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeArea style={styles.safeArea}>
        <View style={styles.content}>
          {filteredSettlements.length > 0 ? (
            <FlatList
              data={filteredSettlements}
              renderItem={renderSettlementItem}
              keyExtractor={(item, index) => `${item.from}-${item.to}-${index}`}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No settlements needed</Text>
              <Text style={styles.emptySubtext}>All expenses are settled!</Text>
            </View>
          )}
        </View>
      </SafeArea>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex:1,
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  settlementItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  settlementText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default SettleUp