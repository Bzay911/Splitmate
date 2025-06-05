import { useFinancial } from "@/contexts/FinancialContext";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../src/firebaseConfig';

const AddExpense = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const { groupId } = useLocalSearchParams();
  const { refreshFinancialSummary } = useFinancial();

  const handleAddExpense = async () => {
  
    if (!amount.trim()) {
        Alert.alert("Error", "Please enter a bill amount");
        return;
      }

      if (!description.trim()) {
        Alert.alert("Error", "Please enter a bill description");
        return;
      }

      try{
        const user = auth.currentUser;
        if(!user){
          Alert.alert("Error", "Please login to add an expense");
          router.replace("/");
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch(
            `http://192.168.1.12:3000/api/groups/${groupId}/addExpense`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                }),
            }
        )

        if(!response.ok){
          throw new Error(`Failed to add expense (${response.status})`);
        }
        Alert.alert("Success", "Expense added successfully");
        router.back();
        
        // Immediately refresh the financial summary
        await refreshFinancialSummary();
      }catch(error){
        console.error("Error adding expense:", error);
        Alert.alert("Error", "Failed to add expense");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Calculator Icon */}
        <View style={styles.iconContainer}>
    <Ionicons name="calculator" size={24} color="#4B7BE5" />
        </View>

        {/* Title and Subtitle */}
        <Text style={styles.title}>New Expense</Text>
        <Text style={styles.subtitle}>Enter your expense details below</Text>

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
              returnKeyType='done'
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddExpense}
        >
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    tintColor: '#4B7BE5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#666',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    flex: 1,
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4B7BE5',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddExpense;