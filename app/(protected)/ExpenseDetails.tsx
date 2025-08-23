import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef, useState, useMemo } from "react";
import { useDeleteExpense } from "@/utils/HandleDelete";
import { useRouter } from "expo-router";
import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";

const ExpenseDetails = () => {
  const {
    expenseAmount,
    paidBy,
    paidByEmail,
    groupName,
    createdAt,
    colors,
    expenseDescription,
    groupId,
    expenseId,
  } = useLocalSearchParams();

  const handleDelete = useDeleteExpense();
  const { token } = useAuth();
  const router = useRouter();
  const snapPoints = useMemo(() => ["70%"], []);

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

  const parsedColors =
    typeof colors === "string" ? colors.split(",") : ["#6366f1", "#818cf8"];

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
    const response = await fetch(apiUrl(`api/expenses/expenses/${expenseId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: newAmount,
        description: newDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update expense (${response.status})`);
    }

    Alert.alert("Success", "Expense updated successfully");
    router.back();
  } catch (error: any) {
    console.error("Error updating expense:", error);
    Alert.alert("Error", error.message);
  }finally {
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
            await handleDelete(
              expenseId as string,
              groupId as string
            );
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Card */}
        <View style={styles.mainCard}>
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
                <Text style={styles.infoSubtext}>{paidByEmail}</Text>
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
          <TouchableOpacity onPress={handleEditBtnPress}>
            <LinearGradient
              colors={parsedColors as [string, string]}
              style={[styles.button]}
            >
              <Text style={styles.buttonText}>Edit Expense</Text>
            </LinearGradient>
          </TouchableOpacity>

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
          index={0} // first snap point visible
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setSheetVisible(false)}
          backgroundStyle={{ backgroundColor: "#1e1e1e" }}
          handleIndicatorStyle={{
            backgroundColor: "#666",
            width: 40,
            height: 4,
          }}
          style={{ zIndex: 1000, elevation: 1000 }}
        >
          <BottomSheetView style={styles.sheetContent}>
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
    backgroundColor: "#121212",
    minHeight: "100%",
  },
  mainCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fccc28",
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
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  infoSubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 2,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  sheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1e1e1e",
  },
  sheetLabel: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#fff",
    fontSize: 16,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});
