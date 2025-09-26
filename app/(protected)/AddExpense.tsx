import { apiUrl } from "@/constants/ApiConfig";
import { useActivity } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const AddExpense = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { groupId, members } = useLocalSearchParams();
  const { refreshFinancialSummary } = useFinancial();
  const { refreshActivities } = useActivity();
  const { user, token } = useAuth();
  const { refreshGroups } = useGroups();
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async () => {
    if (loading) return;

    if (!amount.trim()) {
      Alert.alert("Error", "Please enter a bill amount");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a bill description");
      return;
    }

    try {
      setLoading(true);
      if (!user) {
        Alert.alert("Error", "Please login to add an expense");
        router.replace("/");
        return;
      }

      const groupMembers = members ? JSON.parse(members as string) : [];
      const memberIds = groupMembers.map((m: any) => m._id);
      const response = await fetch(
        apiUrl(`api/expenses/groups/${groupId}/expenses`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            description,
            memberIds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add expense (${response.status})`);
      }
      Alert.alert("Success", "Expense added successfully");
      router.back();

      // Immediately refresh the financial summary
      await refreshFinancialSummary();
      await refreshActivities();
      refreshGroups();
    } catch (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", "Failed to add expense");
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  return (
  <LinearGradient
    colors={["#2a2a2a", "#1a1a1a", "#0f0f0f"]}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Calculator Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="calculator" size={24} color="#4B7BE5" />
            </View>

            {/* Title and Subtitle */}
            <Text style={styles.title}>New Expense</Text>
            <Text style={styles.subtitle}>
              Enter your expense details below
            </Text>

            {/* Bill Amount Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Bill Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.descriptionInputContainer}>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What was this expense for?"
                  placeholderTextColor="#64748b"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>
          </View>
          
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExpense}
          >
            <Text style={styles.buttonText}>
              {loading ? "Adding..." : "Add Expense"}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  </LinearGradient>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    tintColor: "#4B7BE5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 40,
  },
  inputSection: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "white",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: "white",
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    flex: 1,
    color: "white",
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: "top",
    color: "white",
  },
  addButton: {
    backgroundColor: "#4B7BE5",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddExpense;
