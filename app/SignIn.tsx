import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiUrl } from "../constants/ApiConfig";
import { useAuth } from "../contexts/AuthContext";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { handlePostSignupInvites } from "../utils/HandlePostSignupInvites";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  GoogleSignin.configure({
    webClientId:
      "908503370224-bfbpb92bo0cq6u8p9elvv76ones8uddm.apps.googleusercontent.com",
    iosClientId:
      "908503370224-lpv2uf8iosv76gtd65jlsd9k3r4rsl98.apps.googleusercontent.com",
  });

  const googleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const {idToken } = response.data;
        if (!idToken) return;
        await handleGoogleSignin(idToken);
      } else {
        console.log(`Sign in cancelled by user: ${response.data}`);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Login in progress", error.message);
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play service not available", error.message);
            break;
          default:
            console.log(`Something else ${error.message}`);
            console.log(`Something else ${error.code}`);
        }
      }
    }
  };

  const handleGoogleSignin = async (idToken: string) => {
    try {
      const res = await fetch(apiUrl("api/auth/handleGoogleSignin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Login failed", data.message);
        return;
      }
      login(data.appToken, data.user);
      await handlePostSignupInvites(data.user.email);
    } catch (error) {
      console.log(`error from handleSignin: ${error}`);
    }
  };

  const handleSignin = async (email: string, password: string) => {
    try {
      console.log(`Email: ${email}`);
      console.log(`password: ${password}`);
      // Input validation
      if (!email.trim()) {
        alert("Please enter your email address");
        return null;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return null;
      }

      if (!password) {
        alert("Please enter your password");
        return null;
      }

      const response = await fetch(apiUrl("api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.error) {
        alert(`${data.error}!\n\n${data.message}`);
        return;
      }
      login(data.token, data.user);
      await handlePostSignupInvites(data.user.email);
    } catch (error: any) {
      Alert.alert("Error signing in", error.message);
      console.error("Error signing in", error);
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleForgotPassword = () => {
    Alert.alert("Under Development!", "This feature is not available yet.");
  };

  // Handle sign in
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await handleSignin(email, password);
      if (user) {
        console.log("User signed in successfully", user.email);
      }
    } catch (error) {
      console.error("Error signing in", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to your SplitShare account
              </Text>
            </View>

            <View style={styles.form}>
              <InputField
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(""); // Clear error on change
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <InputField
                label="Password"
                icon="lock-outline"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(""); // Clear error on change
                }}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <View style={styles.forgotPasswordContainer}>
                <Pressable onPress={handleForgotPassword}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.signInButton,
                  isLoading && styles.signInButtonDisabled,
                ]}
                accessibilityRole="button"
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.signInText}>
                  {isLoading ? "Signing in..." : "Sign In to SplitShare"}
                </Text>
              </Pressable>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.divider} />
                </View>
              </View>

              <Pressable
                style={styles.googleButton}
                accessibilityRole="button"
                onPress={googleSignIn}
              >
                <FontAwesome name="google" size={20} color="#18181b" />
                <Text style={styles.googleText}>
                  {googleLoading ? "Signing in" : "Continue with Google"}
                </Text>
              </Pressable>

              <Text style={styles.signUpText}>
                Don't have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => router.push("/SignUp")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface InputFieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  returnKeyType?: "next" | "done";
  autoComplete?: "email" | "password" | "off";
  textContentType?: "emailAddress" | "password" | "none";
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
        <MaterialIcons
          name={icon}
          size={20}
          color="white"
          style={styles.inputIcon}
        />
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

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
    textAlign: "center",
    color: "white",
    fontFamily: "Inter-Medium"
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
    fontFamily: "Inter-Regular"
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "white",
    fontFamily: "Inter-Regular"
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#000000ff",
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
    color: "white",
    fontFamily: "Inter-Regular"
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotLink: {
    color: "#fccc28",
    fontSize: 14,
    fontFamily: "Inter-Regular"
  },
  signInButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fccc28",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Inter-Medium"
  },
  dividerContainer: {
    marginBottom: 24,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4e4e7",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#71717a",
    fontFamily: "Inter-Regular"
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderColor: "#e4e4e7",
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#18181b",
    fontFamily: "Inter-Medium"
  },
  signUpText: {
    fontSize: 14,
    textAlign: "center",
    color: "#71717a",
    fontFamily: "Inter-Regular"
  },
  link: {
    color: "#fccc28",
    fontFamily: "Inter-Regular",
    textDecorationLine: "underline"
  },
  errorText: {
    color: "#ef4444", // Red color
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 4,
  },
  signInButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#93c5fd", // Lighter blue
  },
});
