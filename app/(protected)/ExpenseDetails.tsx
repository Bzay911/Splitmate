import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { useRef, useState, useMemo } from "react";
import { useDeleteExpense } from "@/utils/HandleDelete";
import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const ExpenseDetails = () => {
  const {
    expenseAmount,
    paidBy,
    paidByEmail,
    groupName,
    createdAt,
    expenseDescription,
    groupId,
    expenseId,
  } = useLocalSearchParams();

  const handleDelete = useDeleteExpense();
  const { token } = useAuth();
  const router = useRouter();

  // For BottomSheet
  const snapPoints = useMemo(() => [600], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);

  const initialAmount = Array.isArray(expenseAmount)
    ? expenseAmount[0]
    : expenseAmount;
  const initialDescription = Array.isArray(expenseDescription)
    ? expenseDescription[0]
    : expenseDescription ?? "";

  const [newAmount, setnewAmount] = useState(initialAmount);
  const [newDescription, setnewDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const createdAtStr = Array.isArray(createdAt) ? createdAt[0] : createdAt;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleEditBtnPress = () => {
    setSheetVisible(true);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        apiUrl(`api/expenses/expenses/${expenseId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: newAmount,
            description: newDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update expense (${response.status})`);
      }

      Alert.alert("Success", "Expense updated successfully");
      router.back();
    } catch (error: any) {
      console.error("Error updating expense:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }

    bottomSheetRef.current?.close();
  };

  const handleDeleteExpense = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await handleDelete(expenseId as string, groupId as string);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
           {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.navTitle}>Group Details</Text>
        </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <TouchableOpacity style={styles.editAmountHeader} onPress={handleEditBtnPress}>
            <Ionicons name="create-outline" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>${expenseAmount}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoText}>{expenseDescription}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Paid By</Text>
              <Text style={styles.infoText}>{paidBy}</Text>
              {paidByEmail && (
                <Text style={styles.infoSubtext}>({paidByEmail})</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Group</Text>
              <Text style={styles.infoText}>{groupName}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created At</Text>
              <Text style={styles.infoText}>{formatDate(createdAtStr)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteExpense}
          >
            <Text style={styles.buttonText}>Delete Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BottomSheet */}
      {isSheetVisible && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setSheetVisible(false)}
          backgroundStyle={{ backgroundColor: "#f5f5f5" }}
          enableHandlePanningGesture={true}
          handleIndicatorStyle={{
            backgroundColor: "#666",
            width: 40,
            height: 4,
          }}
          backdropComponent={(props) => <BottomSheetBackdrop {...props} />}
          style={{ zIndex: 1000, elevation: 1000 }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <Text style={styles.sheetLabel}>Edit Amount</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={newAmount}
                  onChangeText={setnewAmount}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />

                <Text style={styles.sheetLabel}>Edit Description</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={newDescription}
                  onChangeText={setnewDescription}
                  placeholderTextColor="#666"
                  multiline
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
};

export default ExpenseDetails;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: "100%",
    backgroundColor: "#f5f5f5"
  },
  mainCard: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "gray"
  },
  editAmountHeader:{
    alignItems: "flex-end",
    marginBottom: 10,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    fontFamily: "Inter-Regular"
  },
 
  amount: {
    fontSize: 34,
    color: "green",
    fontFamily: "Inter-Medium"
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    letterSpacing: 1,
    fontFamily: "Inter-Regular"
  },
  infoText: {
    fontSize: 16,
    color: "black",
    fontFamily: "Inter-Regular"
  },
  infoSubtext: {
    fontSize: 14,
    color: "black",
    marginTop: 2,
    fontFamily: "Inter-Regular"
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Inter-Regular"
  },
  sheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  sheetLabel: {
    marginBottom: 8,
    color: "gray",
    fontSize: 12,
    fontFamily: "Inter-Regular"
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "gray",
    color: "black",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: "Inter-Regular"
  },
  saveButton: {
    backgroundColor: "#fccc28",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "black",
    fontSize: 14,
    marginBottom: 4,
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
