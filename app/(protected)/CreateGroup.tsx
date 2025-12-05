import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Define the curated gradients outside the component
const GRADIENTS: [string, string][] = [
  ['#3B82F6', '#06B6D4'], 
  ['#F59E0B', '#EF4444'], 
  ['#10B981', '#3B82F6'], 
  ['#F59E0B', '#D97706'], 
  ['#059669', '#047857'],
  ['#1E293B', '#334155'], 
  ['#F472B6', '#A78BFA'], 
  ['#1E40AF', '#1E3A8A'], 
  ['#6366f1', '#a855f7'], 
  ['#facc15', '#f97316'],
  ['#0ea5e9', '#22d3ee'], 
  ['#8b5cf6', '#d946ef'], 
];

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshGroups } = useGroups();
  
  // 2. Helper to pick a random gradient
  const getRandomGradient = (): [string, string] => {
    const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
    return GRADIENTS[randomIndex];
  };

  const [colors, setColors] = useState<[string, string]>(getRandomGradient());
  const {user, token} = useAuth();

  const handleCreate = async () => {
    // Validate group name
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    // 3. Generate the colors NOW for the API call
    // This fixes the issue where state wouldn't update fast enough before the fetch
    const newGroupColors = getRandomGradient();
    
    setIsLoading(true);
    try {
      if(!user){
        Alert.alert("Error", "Please login to create a group");
        router.replace("/");
        return;
      }

      const response = await fetch(apiUrl("api/groups"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          colors: newGroupColors, // Use the fresh colors directly
        }),
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to create group");
        return;
      }
      await refreshGroups();
      Alert.alert("Success", "Group created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
      setGroupName("");
      setColors(newGroupColors); // Sync state just in case
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.safeArea}>
         {/* Top Navigation Bar */}
                <View style={styles.navBar}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
        
                  <Text style={styles.navTitle}>Create Group</Text>
                </View>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={32} color="white" />
            </View>
            
            <Text style={styles.subtitle}>
              Create a group to start splitting expenses with mates
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter group name"
                placeholderTextColor="gray"
                value={groupName}
                onChangeText={setGroupName}
                maxLength={50}
                autoFocus
                editable={!isLoading}
              />
              <Text style={styles.characterCount}>
                {groupName.length}/50
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.createBtn, 
                (!groupName.trim() || isLoading) && styles.createBtnDisabled
              ]} 
              onPress={handleCreate}
              disabled={!groupName.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Text style={styles.createBtnText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  keyboardView: {
    flex: 1,
  },
    scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fccc28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    fontFamily: "Inter-Regular"
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter-Regular'
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    width: '100%',
    fontFamily: "Inter-Regular"
  },
  characterCount: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: "Inter-Regular"
  },
  createBtn: {
    backgroundColor: "#fccc28",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#fccc28",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createBtnDisabled: {
    backgroundColor: "gray",
    shadowOpacity: 0,
    elevation: 0,
  },
  createBtnText: {
    fontSize: 14,
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

export default CreateGroup;