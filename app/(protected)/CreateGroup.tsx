import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

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
    <LinearGradient
      colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

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
                placeholderTextColor="#64748b"
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: 'white',
    width: '100%',
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
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
    backgroundColor: "#64748b",
    shadowOpacity: 0,
    elevation: 0,
  },
  createBtnText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default CreateGroup;
