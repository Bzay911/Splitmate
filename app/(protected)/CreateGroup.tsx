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

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshGroups } = useGroups();
  const [colors, setColors] = useState<[string, string]>([getRandomColor(), getRandomColor()]);
  const {user, token} = useAuth();

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const randomizeGradient = () => {
    setColors([getRandomColor(), getRandomColor()]);
  };


  const handleCreate = async () => {
    // Validate group name
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    randomizeGradient();
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
          colors: colors,
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
    } catch (error) {
      Alert.alert("Error", "Failed to create group");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <SafeAreaView style={styles.safeArea}>
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
              <Ionicons name="people" size={48} color="#fccc28" />
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
    backgroundColor: 'black'
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
  backButton: {
    padding: 8,
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
    backgroundColor: 'rgba(252, 204, 40, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
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
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter-Medium'
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: 'white',
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
    borderRadius: 12,
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
    color: "black",
    fontSize: 16,
    fontFamily: "Inter-Regular"
  },
});

export default CreateGroup;
