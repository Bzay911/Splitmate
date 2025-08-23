import { Alert } from "react-native";
import { apiUrl } from "../constants/ApiConfig";
import { useAuth } from "../contexts/AuthContext";
import { useExpense } from "../contexts/ExpenseContext";
import { useFinancial } from "../contexts/FinancialContext";
import { useActivity } from "../contexts/ActivityContext";

export const useDeleteExpense = () => {
  const { token } = useAuth();
  const { fetchExpenses } = useExpense();
  const { refreshFinancialSummary } = useFinancial();
  const { refreshActivities } = useActivity();

  const deleteExpense = async (expenseId: string, groupId: string) => {
    try {
      const response = await fetch(
        apiUrl(`api/expenses/groups/${groupId}/expenses/${expenseId}`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to delete expense (${response.status})`);
      }

      Alert.alert("Success", data.message || "Expense deleted successfully");
      fetchExpenses(groupId as string);
      await refreshFinancialSummary();
      await refreshActivities();
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      Alert.alert("Error", error.message);
    }
  };

  return deleteExpense;
};
