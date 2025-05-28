import GroupsContext from "@/contexts/GroupsContext";
import { router } from "expo-router";
import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

const CreateGroup = () => {
  const { addGroup } = useContext(GroupsContext);
  const [groupName, setGroupName] = useState("");

  const handleCreate = () => {
    if (!groupName.trim()) return;
    
    addGroup({
      id: Date.now().toString(), // Using timestamp as a unique ID
      name: groupName,
      image: require("../assets/images/dummyProfile.png"),
      totalExpense: 0,
      members: [],
    });
    setGroupName(""); // Clear input after creating
    router.back();  
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Group Name" 
        value={groupName} 
        onChangeText={setGroupName} 
      />
      <TouchableOpacity 
        style={styles.createBtn} 
        onPress={handleCreate}
      >
        <Text style={styles.createBtnText}>Create</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 12,
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: '80%',
    marginTop: 20,
  },
  createBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroup;