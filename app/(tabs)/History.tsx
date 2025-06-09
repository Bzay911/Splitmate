import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'

const History = () => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
    <View style={styles.topSection}>
      <Text style={styles.topBarTitle}>History</Text>
    </View>
 
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
})

export default History