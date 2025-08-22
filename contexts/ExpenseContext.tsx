import { apiUrl } from "@/constants/ApiConfig";
import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { useFinancial } from "./FinancialContext";
import { useGroups } from "./GroupsContext";
import { useActivity } from "./ActivityContext";

interface GroupMember {
  _id: string;
  displayName: string;
  email: string;
}

interface Expense {
  _id: string;
  paidBy: GroupMember;
  amount: number;
  description: string;
  date: Date;
  splitBetween: GroupMember[];
}

interface Balance {
  email: string;
  displayName: string;
  userId: string;
  balance: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface ExpenseContextType {
  expenses: Expense[];
  groupMembers: GroupMember[];
  fetchExpenses: (groupId: string) => Promise<void>;
  isLoading: boolean;
  balances: Balance[];
  creditors: Balance[];
  debtors: Balance[];
  whoNeedsToPayWhom: () => Settlement[];
  settleUp: (settlement: Settlement, groupId: string) => Promise<void>;
  resetSettlements: () => void;
}

interface BackendSettlement {
  _id: string;
  groupId: string;
  fromUser: GroupMember;
  toUser: GroupMember;
  amount: number;
  settledAt: Date;
}

interface ExpenseProviderProps {
  children: ReactNode;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: ExpenseProviderProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [creditors, setCreditors] = useState<Balance[]>([]);
  const [debtors, setDebtors] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<BackendSettlement[]>([]);
  const { token, user } = useAuth();
  const { refreshGroups } = useGroups();
  const { refreshFinancialSummary } = useFinancial();
  const { refreshActivities } = useActivity();

  const fetchExpenses = useCallback(
    async (groupId: string) => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch both expenses and settlements
        const [expensesResponse, settlementsResponse] = await Promise.all([
          fetch(apiUrl(`api/expenses/groups/${groupId}/expenses`), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(apiUrl(`api/expenses/groups/${groupId}/settlements`), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!expensesResponse.ok) {
          throw new Error(
            `Failed to fetch expenses (${expensesResponse.status})`
          );
        }

        const expensesData = await expensesResponse.json();
        setExpenses(expensesData.expenses);

        // Handle settlements response (might not exist for all backends)
        if (settlementsResponse.ok) {
          const settlementsData = await settlementsResponse.json();
          setSettlements(settlementsData.settlements || []);
        } else {
          setSettlements([]);
        }

        extractGroupMembers(expensesData.expenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, token]
  );

  const extractGroupMembers = (expenses: Expense[]) => {
    const memberMap = new Map<string, GroupMember>();

    expenses.forEach((expense) => {
      if (expense.splitBetween && Array.isArray(expense.splitBetween)) {
        expense.splitBetween.forEach((member) => {
          if (!memberMap.has(member._id)) {
            memberMap.set(member._id, member);
          }
        });
      }

      if (expense.paidBy && !memberMap.has(expense.paidBy._id)) {
        memberMap.set(expense.paidBy._id, expense.paidBy);
      }
    });

    const uniqueMembers = Array.from(memberMap.values());
    setGroupMembers(uniqueMembers);
  };

  // Calculate individual expense for each member
  const getIndividualExpense = useCallback(
    (member: GroupMember) => {
      const totalExpense = expenses.reduce((sum, expense) => {
        if (expense.paidBy._id === member._id) {
          return sum + expense.amount;
        }
        return sum;
      }, 0);
      return totalExpense;
    },
    [expenses]
  );


  // Calculate settlement adjustments for each member
  const getSettlementAdjustments = useCallback(
    (memberId: string) => {
      let adjustments = 0;

      settlements.forEach((settlement) => {
        if (settlement.fromUser._id === memberId) {
          // Member paid someone, so their balance improves (less debt/more credit)
          adjustments += settlement.amount;
        }
        if (settlement.toUser._id === memberId) {
          // Member received payment, so their balance reduces (less credit/more debt)
          adjustments -= settlement.amount;
        }
      });

      return adjustments;
    },
    [settlements]
  ); 

  useEffect(() => {
    if (groupMembers.length > 0 && expenses.length > 0) {
      const newBalances = groupMembers.map((member) => {
        const individualExpense = getIndividualExpense(member);
        const totalFairshare = expenses.reduce((acc, e) => {
          const isInExpense = e.splitBetween.some(
            (sb) => sb._id === member._id
          );
          if (isInExpense) {
            acc += e.amount / e.splitBetween.length;
          }
          return acc;
        }, 0);
        const baseBalance = individualExpense - totalFairshare;
        const settlementAdjustments = getSettlementAdjustments(member._id);
        const finalBalance = baseBalance + settlementAdjustments;
        return {
          email: member.email,
          displayName: member.displayName,
          userId: member._id,
          balance: finalBalance,
        };
      });
      setBalances(newBalances);
    }
  }, [
    groupMembers,
    expenses,
    getIndividualExpense,
    settlements,
    getSettlementAdjustments,
  ]);

  // Calculate creditors and debtors
  useEffect(() => {
    console.log("Balances:", balances);

    if (balances.length > 0) {
      const whoGetsPayment = balances
        .filter((item) => item.balance > 0.01)
        .sort((a, b) => b.balance - a.balance);
      const whoNeedToPay = balances
        .filter((item) => item.balance < -0.01) 
        .sort((a, b) => a.balance - b.balance);

      setCreditors(whoGetsPayment);
      setDebtors(whoNeedToPay);
    }
  }, [balances]);


  const addSettlementToState = (settlementData: any) => {
    // Convert backend settlement to our format and add to settlements array
    const newSettlement: BackendSettlement = {
      _id: settlementData._id || Date.now().toString(), // Fallback ID
      groupId: settlementData.groupId,
      fromUser: {
        _id:
          settlementData.fromUserId ||
          getUserIdFromDisplayName(settlementData.fromUser?.displayName) ||
          "",
        displayName: settlementData.fromUser?.displayName || "",
        email: settlementData.fromUser?.email || "",
      },
      toUser: {
        _id:
          settlementData.toUserId ||
          getUserIdFromDisplayName(settlementData.toUser?.displayName) ||
          "",
        displayName: settlementData.toUser?.displayName || "",
        email: settlementData.toUser?.email || "",
      },
      amount: settlementData.amount,
      settledAt: new Date(settlementData.settledAt || Date.now()),
    };

    setSettlements((prev) => [...prev, newSettlement]);
  };

  const whoNeedsToPayWhom = useCallback((): Settlement[] => {
    let i = 0;
    let j = 0;
    const settlements: Settlement[] = [];

    // Create deep copies to avoid mutating original arrays
    const debtorsCopy = debtors.map((debtor) => ({ ...debtor }));
    const creditorsCopy = creditors.map((creditor) => ({ ...creditor }));

    while (i < debtorsCopy.length && j < creditorsCopy.length) {
      const debtor = debtorsCopy[i];
      const creditor = creditorsCopy[j];

      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;
      const transferAmount = Math.min(debtAmount, creditAmount);

      if (transferAmount > 0.01) {
        settlements.push({
          from: debtor.displayName,
          to: creditor.displayName,
          amount: Number(transferAmount.toFixed(2)),
        });

        debtor.balance += transferAmount;
        creditor.balance -= transferAmount;
      }

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return settlements;
  }, [debtors, creditors]);

  // Helper function to get user ID from display name
  const getUserIdFromDisplayName = (displayName: string): string | null => {
    const member = groupMembers.find((m) => m.displayName === displayName);
    return member?._id || null;
  };

  // Function to manually reset settlements (if needed)
  const resetSettlements = () => {
    setSettlements([]);
  };

  const settleUp = async (settlement: Settlement, groupId: string) => {
    try {
      const fromUserId = getUserIdFromDisplayName(settlement.from);
      const toUserId = getUserIdFromDisplayName(settlement.to);

      const response = await fetch(apiUrl("api/expenses/groups/settleup"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: groupId,
          fromUserId: fromUserId,
          toUserId: toUserId,
          amount: settlement.amount,
        }),
      });

      const data = await response.json();

      addSettlementToState({
        fromUser: data.updatedSettlement.fromUser,
        toUser: data.updatedSettlement.toUser,
        amount: data.updatedSettlement.amount,
        fromUserId: fromUserId,
        toUserId: toUserId,
        groupId: groupId,
      });

      if (response.ok) {
        Alert.alert("Success", "Settlement saved successfully");
        refreshFinancialSummary();
        refreshGroups();
        refreshActivities();
        router.back();
      } else {
        Alert.alert("Error", "Failed to save settlement");
      }
    } catch (error) {
      console.error("Error saving settlement:", error);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        groupMembers,
        fetchExpenses,
        isLoading,
        balances,
        creditors,
        debtors,
        whoNeedsToPayWhom,
        settleUp,
        resetSettlements,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};
