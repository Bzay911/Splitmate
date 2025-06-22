import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";
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


export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  
  const handleSignUp = async (email: string, password: string, fullName: string) => {
   try {
     const response = await fetch(apiUrl('api/auth/signup'), {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         email: email,
         password: password,
         displayName: fullName,
       }),
     });
  
     console.log("response", response);
     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || 'Failed to create user');
     }

     const { token, user } = await response.json();
     login(token, user);
   } catch (error){
    console.error("Error creating user", error);
    return null;
   }
  }
  
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
      
        console.log("user", user);
        
      //  router.replace("/(protected)/(tabs)");
     }
   } catch (error) {
     console.error("Error creating user", error);
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
               colors={agreedToTerms ? ["#fccc28", "#fccc28"] : ["#fccc28", "#fccc28"]}
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
   </LinearGradient>
 );
}


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
   backgroundColor: "#fccc28",
   borderColor: "#fccc28",
 },
 termsText: {
   flex: 1,
   fontSize: 14,
   lineHeight: 20,
   color: "white",
 },
 termsLink: {
   color: "#fccc28",
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
