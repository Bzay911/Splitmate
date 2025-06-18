import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiUrl } from "../constants/ApiConfig";
import { auth } from "../src/firebaseConfig";

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const handleSignUp = async (email: string, password: string, fullName: string) => {
  try {
    // 1. Create Firebase Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Update Firebase Profile
    await updateProfile(user, {
      displayName: fullName
    });

    // 3. Create user in backend
    const response = await fetch(apiUrl('api/auth/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid: user.uid,
        email: user.email,
        displayName: fullName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user profile');
    }

    return user;
  } catch (error: any) {
    // Firebase Auth specific errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email is already registered. Please try logging in instead.');
          break;
        case 'auth/invalid-email':
          alert('Please enter a valid email address.');
          break;
        case 'auth/operation-not-allowed':
          alert('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          alert('Please choose a stronger password (at least 6 characters).');
          break;
        default:
          alert(`Error creating account: ${error.message}`);
      }
    } else {
      // Backend or other errors
      alert(error.message || 'Error creating user. Please try again.');
    }
    return null;
  }
}

function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons name={icon} size={20} color="#71717a" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#a1a1aa"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          {...props}
        />
      </View>
    </View>
  );
}

export default function SignUp() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form validation function
  const validateForm = () => {
    if (!fullName.trim()) {
      alert("Please enter your full name");
      return false;
    }

    if (!email.trim()) {
      alert("Please enter your email address");
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (!password) {
      alert("Please enter a password");
      return false;
    }

    // Password strength validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }

    return true;
  };

  // Update the onPress handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await handleSignUp(email, password, fullName);
      if (user) {
        router.replace("/(protected)/(tabs)");
      }
    } catch (error) {
      console.error("Error creating user", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join thousands of users splitting bills
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.form}>
            <InputField
              label="Full Name"
              icon="person-outline"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />

            <InputField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <InputField
              label="Password"
              icon="lock-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
            />

            <InputField
              label="Confirm Password"
              icon="lock-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
            />

            <View style={styles.termsContainer}>
              <Pressable
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreedToTerms }}
                style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
              >
                {agreedToTerms && <MaterialIcons name="check" size={16} color="#fff" />}
              </Pressable>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>
                  Terms of Service
                </Text>
                {" "}and{" "}
                <Text style={styles.termsLink}>
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <Pressable
              style={[
                styles.createAccountButton,
                (!agreedToTerms || isLoading) && styles.createAccountButtonDisabled,
              ]}
              accessibilityRole="button"
              onPress={handleSubmit}
              disabled={!agreedToTerms || isLoading}
            >
              <LinearGradient
                colors={agreedToTerms ? ["#2563eb", "#1d4ed8"] : ["#93c5fd", "#60a5fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.createAccountButtonText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text 
                style={styles.termsLink}
                onPress={() => router.replace("/SignIn")}
              >
                Login
              </Text>
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "#18181b",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#71717a",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#18181b",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#f4f4f5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#18181b",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#e4e4e7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#18181b",
  },
  termsLink: {
    color: "#2563eb",
    fontWeight: "500",
  },
  createAccountButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createAccountButtonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createAccountButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInText: {
    fontSize: 14,
    textAlign: "center",
    color: "#71717a",
  },
});
