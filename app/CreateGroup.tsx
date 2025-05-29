import GroupsContext from "@/contexts/GroupsContext";
import { router } from "expo-router";
import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

const CreateGroup = () => {
  // const { addGroup } = useContext(GroupsContext);
  const [groupName, setGroupName] = useState("");

  const handleCreate = async() => {
    if (!groupName.trim()) return;
    try{
      const response = await fetch('http://192.168.1.12:3000/addGroup',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: groupName, totalExpense: 0, members: [], image: "https://www.ibcs.com/wp-content/uploads/2024/01/Projekt-bez-nazwy-15.png" }),
      });
      if (!response.ok) {
        throw new Error('Failed to create group');
      }
      const data = await response.json();
      console.log("Group created successfully");
      setGroupName("");
      router.back();
    } catch (error) {
      console.error("Error creating group:", error);
    }
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