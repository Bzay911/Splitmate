import { View, Text, SafeAreaView, Image, StyleSheet } from 'react-native'
import React from 'react'

const createGroup = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
      <Text>Cancel</Text>
      <Text>Create a group</Text>
      <Text>Create</Text>
      </View>
    </SafeAreaView>
  )
}

const styles  = StyleSheet.create({
  safeArea:{
  flex: 1,
  margin:12
  },
topBar:{
  flexDirection: 'row',
  justifyContent: 'space-between',
}
})

export const options = {
  // title: 'Create Group',
  headerShown: false,
};

export default createGroup