import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiUrl } from "../constants/ApiConfig";
import { useAuth } from "../contexts/AuthContext";

export function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  
  const { login } = useAuth();

  const handleSignin = async (email: string, password: string) => {
    try {
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

      const response = await fetch(apiUrl('api/auth/login'), {
        method: 'POST',  
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("data", data);
      console.log("data.user", data.user);
      console.log("data.token", data.token);
      login(data.token, data.user);
      // return data.user;
    } catch (error: any) {
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
    <LinearGradient
    colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
    style={styles.safeArea}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to your Splitmate account
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
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <View style={styles.forgotPasswordContainer}>
            <Pressable onPress={() => {}}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.signInText}>
              {isLoading ? "Signing in..." : "Sign In to Splitmate"}
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
          >
            <FontAwesome name="google" size={20} color="#18181b" />
            <Text style={styles.googleText}>Continue with Google</Text>
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
    </SafeAreaView>
    </LinearGradient>
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
        <MaterialIcons name={icon} size={20} color="white" style={styles.inputIcon} />
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
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "white",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#2a2a2a",
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
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotLink: {
    color: "#fccc28",
    fontSize: 14,
    fontWeight: "500",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "600",
    marginLeft: 12,
    color: "#18181b",
  },
  signUpText: {
    fontSize: 14,
    textAlign: "center",
    color: "#71717a",
  },
  link: {
    color: "#fccc28",
    fontWeight: "500",
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