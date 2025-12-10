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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AvatarName =
  | "profileImage1"
  | "profileImage2"
  | "profileImage3"
  | "profileImage4"
  | "profileImage5"
  | "profileImage6";

const EditProfile = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user, token, updateUser } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.avatar || "profileImage6"
  );

  // for displaying avatar options in modal
  const avatarImages = [
    require("../../assets/images/profileImage1.png"),
    require("../../assets/images/profileImage2.png"),
    require("../../assets/images/profileImage3.png"),
    require("../../assets/images/profileImage4.png"),
    require("../../assets/images/profileImage5.png"),
    require("../../assets/images/profileImage6.png"),
  ];

  // for sending avatar names to backend
  const avatarNames = [
    "profileImage1",
    "profileImage2",
    "profileImage3",
    "profileImage4",
    "profileImage5",
    "profileImage6",
  ] as const;

  // mapping avatar names to image sources
  const avatarMap = {
    profileImage1: require("../../assets/images/profileImage1.png"),
    profileImage2: require("../../assets/images/profileImage2.png"),
    profileImage3: require("../../assets/images/profileImage3.png"),
    profileImage4: require("../../assets/images/profileImage4.png"),
    profileImage5: require("../../assets/images/profileImage5.png"),
    profileImage6: require("../../assets/images/profileImage6.png"),
  };

  // Initialize with user data when component mounts
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");

      if (avatarNames.includes(user.avatar as any)) {
        setSelectedAvatar(user.avatar as AvatarName);
      } else {
        setSelectedAvatar("profileImage1");
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setIsSaving(true);
    try {
      // Update backend profile
      const response = await fetch(apiUrl(`api/auth/profile`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          avatar: selectedAvatar,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile (${response.status})`);
      }

      const data = await response.json();
      console.log("Profile updated:", data);
      // Update the user in AuthContext immediately
      updateUser({
        displayName: data.user.displayName ?? user.displayName,
        avatar: data.user.avatar ?? user.avatar,
      });

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
          <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setIsModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                  <Text>Select your avatar</Text>
                  <Ionicons
                    name="close-outline"
                    size={24}
                    color="black"
                    onPress={() => setIsModalVisible(false)}
                    style={styles.closeBtnModel}
                  />
                </View>
                <View style={styles.imageGrid}>
                  {avatarImages.map((img, index) => {
                    const avatarName = avatarNames[index];
                    const isSelected = selectedAvatar === avatarName;

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedAvatar(avatarName);
                          setIsModalVisible(false);
                        }}
                        style={[
                          styles.imageOption,
                          isSelected && {
                            borderColor: "#fccc28",
                            borderWidth: 2,
                          },
                        ]}
                      >
                        <Image
                          source={img}
                          style={styles.displayProfileImage}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </Modal>
          <View style={styles.content}>
            <View style={styles.imageContainer}>
              <Image
                source={
                  avatarMap[selectedAvatar as keyof typeof avatarMap] ??
                  avatarMap["profileImage6"]
                }
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.selectImageBtn}
                onPress={() => setIsModalVisible(!isModalVisible)}
              >
                <Ionicons name="create-outline" size={24} color="black" />
              </TouchableOpacity>
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
  closeBtnModel: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  selectImageBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fccc28",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  displayProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter-Regular",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Inter-Regular",
    color: "gray",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  characterCount: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "Inter-Regular",
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
    color: "black",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  navBar: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    gap: 18,
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "black",
  },

  centeredView: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: 100,
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  imageOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 60,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});

export default EditProfile;
