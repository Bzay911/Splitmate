import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user, token, updateUser } = useAuth();

  // Initialize with user data when component mounts
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setIsSaving(true);
    try {
      // Get the current Firebase user
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Get the ID token from the current user

      // Update backend profile
      const response = await fetch(apiUrl(`api/auth/profile`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile (${response.status})`);
      }

      // Update the user in AuthContext immediately
      updateUser({ displayName });

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
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

          <Text style={styles.navTitle}>Edit Profile</Text>
        </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/cat.png")}
                style={styles.profileImage}
              />
            </View>

            <Text style={styles.subtitle}>Your profile picture</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor="#64748b"
                maxLength={30}
                editable={!isSaving}
              />
              <Text style={styles.characterCount}>{displayName.length}/30</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!displayName.trim() || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!displayName.trim() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#374151",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter-Regular"
  },
  inputContainer: {
    width: "100%",
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
     fontFamily: "Inter-Regular"
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
     fontFamily: "Inter-Regular"
  },
  characterCount: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
     fontFamily: "Inter-Regular"
  },
  saveButton: {
    backgroundColor: "#fccc28",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#fccc28",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#64748b",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "white",
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

export default EditProfile;
