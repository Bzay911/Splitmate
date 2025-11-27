import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as SafeArea } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useExpense } from '../../contexts/ExpenseContext';

const SettleUp = () => {
  const router = useRouter();
  const { user } = useAuth();
  const username = user?.displayName;
  const { settlements, groupId } = useLocalSearchParams();
  const { settleUp } = useExpense();

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
          onPress: async() => {
            try {
              await settleUp(settlement, groupId as string);
            } catch (error) {
              console.error("SettleUp: Error in settleUp call:", error);
            }
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
   
      <SafeArea style={styles.safeArea}>
         {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.navTitle}>Settle Up</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.titleText}>Do you want to settle up this balance?</Text>
          <Text style={styles.settleText}>(Press to settle)</Text>

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
  titleText:{
    fontSize: 18,
    fontFamily: "Inter-Regular",
  },
  
  settleText:{
    color: 'gray',
    marginBottom: 24,
    fontFamily: 'Inter-Regular'
  },
  list: {
    flex: 1,
  },
  settlementItem: {
    backgroundColor: "gray",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  settlementText: {
    fontSize: 14,
    color: 'white',
    fontFamily: "Inter-Regular"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
    fontFamily: "Inter-Medium"
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontFamily: "Inter-Regular"
  },
    navBar: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    gap: 18
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "black",
  },
});

export default SettleUp