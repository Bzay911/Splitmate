import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../src/firebaseConfig";

const handleSignin = async (email: string, password: string) => {
  try {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // 2. Check if user exists in your backend
    const response = await fetch('http://192.168.1.12:3000/api/auth/login', {
      method: 'GET',  
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.status === 404) {
      // User doesn't exist in your database
      alert("Please create an account first");
      router.push("/SignUp");  // Redirect to signup
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to sign in');
    }

    console.log("User signed in successfully", userCredential.user);
    router.push("/Home");
    return userCredential.user;

  } catch (error) {
    console.error("Error signing in", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      alert("Invalid email or password");
    } else {
      alert("Error signing in. Please try again.");
    }
    return null;
  }
};

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

export function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
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
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
          />

          <View style={styles.forgotPasswordContainer}>
            <Pressable onPress={() => {}}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.signInButton}
            accessibilityRole="button"
            onPress={async() => {
              try{
                const user = await handleSignin(email, password);
                // const user = await handleSignin("gurungbeejaya@gmail.com", "aaaaaaaa");
                if(user){
                  router.push("/Home");
                  console.log("User signed in successfully", user.email);
                }
              } catch (error){
                console.error("Error signing in", error);
              }
            }}
          >
            <Text style={styles.signInText}>Sign In to Splitmate</Text>
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
            onPress={() => {}}
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotLink: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#2563eb",
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
    borderWidth: 1,
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
    color: "#2563eb",
    fontWeight: "500",
  },
});

export default LoginScreen; 