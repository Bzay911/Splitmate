import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {auth} from "../src/firebaseConfig";


const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");


  const handleCreate = async () => {
    // Validate group name
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    try {
      const user = auth.currentUser;
      if(!user){
        Alert.alert("Error", "Please login to create a group");
        router.replace("/");
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch("http://192.168.1.12:3000/api/addGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          image:
            "https://www.ibcs.com/wp-content/uploads/2024/01/Projekt-bez-nazwy-15.png",
      
        }),
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to create group");
        return;
      }
      Alert.alert("Success", "Group created successfully");
      setGroupName("");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
      console.log(error);
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
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 12,
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "gray",
    padding: 10,
    width: "80%",
    marginTop: 20,
  },
  createBtn: {
    backgroundColor: "#007AFF",  
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  createBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  }

});

export default CreateGroup;
