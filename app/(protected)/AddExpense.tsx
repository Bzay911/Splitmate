import { apiUrl } from "@/constants/ApiConfig";
import { useActivity } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
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
                  placeholderTextColor="gray"
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
                  placeholderTextColor="gray"
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
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'black'
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
    tintColor: "#fccc28",
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
    color: "white",
    fontFamily: "Inter-Regular"
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 40,
    fontFamily: "Inter-Regular"
  },
  inputSection: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "white",
    fontFamily: "Inter-Regular"
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
    fontFamily: "Inter-Regular"
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
    fontFamily: "Inter-Regular"
  },
  addButton: {
    backgroundColor: "#fccc28",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter-Regular"
  },
});

export default AddExpense;
