import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FloatingAction } from "react-native-floating-action";

interface GroupMember {
  _id: string;
  displayName: string;
  email: string;
}

interface GroupDetails {
  _id: string;
  name: string;
  image: string;
  totalExpense: number;
  members: GroupMember[];
  createdBy: GroupMember;
  colors: [string, string];
}

interface Expense {
  _id: string;
  paidBy: GroupMember;
  amount: number;
  description: string;
  date: Date;
}

interface Balance {
  email: string;
  balance: number;
}

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options);
};

const calculateDividend = (totalExpense: number, totalMembers: number) => {
  const dividend = parseFloat((totalExpense / totalMembers).toFixed(2));
  return dividend;
};

const GroupDetails = () => {
  const { groupId, groupName, image, colors } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [fairshare, setFairshare] = useState<number>(0);
  const [creditors, setCreditors] = useState<Balance[]>([]);
  const [debtors, setDebtors] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { groups } = useGroups();

  const parsedColors =
    typeof colors === "string" ? colors.split(",") : ["#6366f1", "#818cf8"];

  // Refresh group details when groups context updates (e.g., after inviting someone)
  useEffect(() => {
    if (groups.length > 0 && groupId) {
      const currentGroup = groups.find(g => g._id === groupId);
      if (currentGroup && groupDetails) {
        // If the member count has changed, refresh the details
        if (currentGroup.members.length !== groupDetails.members.length) {
          fetchGroupDetails();
        }
      }
    }
  }, [groups, groupId, groupDetails]);

  useEffect(() => {
    if (groupDetails) {
      setFairshare(
        calculateDividend(
          groupDetails.totalExpense,
          groupDetails.members.length
        )
      );
    }
  }, [groupDetails]);

  const fetchGroupDetails = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(apiUrl(`api/groups/${groupId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch group (${response.status})`);
      }

      const data = await response.json();
      setGroupDetails(data.group);
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, user]);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        apiUrl(`api/expenses/groups/${groupId}/expenses`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses (${response.status})`);
      }

      const data = await response.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }, [groupId, user]);

  useEffect(() => {
    if (user) fetchGroupDetails();
  }, [fetchGroupDetails]);

  // Refetch data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchExpenses();
      }
    }, [fetchExpenses])
  );

  const getIndividualExpense = useCallback((member: GroupMember) => {
    const totalExpense = expenses.reduce((sum, expense) => {
      if (expense.paidBy._id === member._id) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);
    return totalExpense;
  }, [expenses]);

  useEffect(() => {
    if (groupDetails && expenses && fairshare) {
      const newBalances = groupDetails.members.map((member) => {
        const balance = getIndividualExpense(member) - fairshare;
        return {
          email: member.email,
          balance: balance,
        };
      });
      setBalances(newBalances);
    }
  }, [groupDetails, expenses, fairshare, getIndividualExpense]);

  useEffect(() => {
    if (balances.length > 0) {
      const whoGetsPayment = balances
        .filter((item) => item.balance > 0)
        .sort((a, b) => b.balance - a.balance);
      const whoNeedToPay = balances
        .filter((item) => item.balance < 0)
        .sort((a, b) => a.balance - b.balance);

      setCreditors(whoGetsPayment);
      setDebtors(whoNeedToPay);
    }
  }, [balances]);

  if (!groupDetails) {
    return (
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading group details...</Text>
          </View>
        ) : (
          <Text style={styles.errorText}>Group not found</Text>
        )}
      </SafeAreaView>
    );
  }

  const handleSettingsPress = () => {
    if (groupDetails) {
      router.push({
        pathname: "/GroupSettings",
        params: {
          groupId: groupDetails._id,
          groupName: groupDetails.name,
          members: JSON.stringify(groupDetails.members),
        },
      });
    }
  };

  const whoNeedsToPayWhom = () => {
    let i = 0;
    let j = 0;
    const settlements: { from: string; to: string; amount: number }[] = [];

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;
      const transferAmount = Math.min(debtAmount, creditAmount);

      if (transferAmount > 0.01) {
        const debtorMember = groupDetails?.members.find(
          (member) => member.email === debtor.email
        );
        const creditorMember = groupDetails?.members.find(
          (member) => member.email === creditor.email
        );

        if (debtorMember && creditorMember) {
          settlements.push({
            from: debtorMember.displayName,
            to: creditorMember.displayName,
            amount: Number(transferAmount.toFixed(2)),
          });
        }

        debtor.balance += transferAmount;
        creditor.balance -= transferAmount;
      }

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return settlements;
  };

  const actions = [
    {
      text: "Scan Receipt",
      icon: <Ionicons name="scan-outline" size={24} color="white" />,
      name: "scanreceipt",
      position: 1,
    },
    {
      text: "Add Expense Manually",
      icon: <Ionicons name="add" size={24} color="white" />,
      name: "addexpense",
      position: 2,
    },
  ];

  const renderSettlements = () => {
    const settlements = whoNeedsToPayWhom();
    if (settlements.length === 0) return null;
    return (
      <View>
        {settlements.map((settlement, index) => (
          <View
            key={settlement.from + settlement.to}
            style={styles.settlementItem}
          >
            <Text style={styles.settlementText}>
              <Text style={styles.debtorName}>
                {settlement.from === user?.displayName
                  ? "You"
                  : settlement.from}
              </Text>{" "}
              <Text style={styles.settlementText}>should pay </Text>
              <Text style={styles.settlementAmount}>
                ${settlement.amount}
              </Text>{" "}
              <Text style={styles.settlementText}>to </Text>
              <Text style={styles.creditorName}>
                {settlement.to === user?.displayName ? "You" : settlement.to}
              </Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#2a2a2a", "#1a1a1a", "#0f0f0f"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={parsedColors as [string, string]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={handleSettingsPress}
            >
            <Text style={styles.groupName}>{groupName}</Text>
              <Ionicons name="settings" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.oweSection}>
              <View>
                <Text style={styles.billTitle}>Total Expense</Text>
                <Text style={styles.billAmount}>
                  ${groupDetails.totalExpense.toFixed(2)}
                </Text>
              </View>

              <View style={styles.verticalLine} />

              <View>
                <Text style={styles.splitTitle}>Split Between</Text>
                <View style={styles.splitMembersContainer}>
                  <Text style={styles.splitMembers}>
                    {groupDetails.members.length}
                  </Text>
                  {isLoading && (
                    <View style={styles.refreshIndicator}>
                      <Text style={styles.refreshText}>↻</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.dividendSection}>
            {creditors.find((item) => item.email === user?.email) ? (
              <Text style={styles.ownerDividend}>
                You are owed $
                {creditors
                  .find((item) => item.email === user?.email)
                  ?.balance.toFixed(2)}{" "}
                overall
              </Text>
            ) : debtors.find((item) => item.email === user?.email) ? (
              <Text style={styles.ownerOwe}>
                You owe $
                {Math.abs(
                  debtors.find((item) => item.email === user?.email)?.balance ||
                    0
                ).toFixed(2)}{" "}
                overall
              </Text>
            ) : (
              <Text style={styles.settlementText}>You are all settled up!</Text>
            )}
            {renderSettlements()}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonWrapper}>
              <LinearGradient
                colors={["#EF4444", "#EC4899"]}
                style={styles.settleupBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Settle up</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonWrapper}>
              <LinearGradient
                colors={["#FB923C", "#EAB308"]}
                style={styles.exportBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Export</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Expenses</Text>

          {expenses.map((expense) => (
            <View key={expense._id} style={styles.expensesContainer}>
              <View style={styles.expenseIcon}>
                <Ionicons name="cart" size={24} color="black" />
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{formatDate(expense.date)}</Text>
              </View>

              <View style={styles.expenses}>
                <Text style={styles.expenseDescription}>
                  {expense.description}
                </Text>
                <Text style={styles.expenseAmount}>
                  {expense?.paidBy?.displayName || "Anonymous"} added{" "}
                  <Text style={styles.addedTotalCost}>${expense.amount}</Text>
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FloatingAction
        actions={actions}
        color="#fccc28"
        floatingIcon={<Ionicons name="add" size={24} color="black" />}
        onPressItem={(name) => {
          if (name === "scanreceipt") {
            router.push({
              pathname: "/Camera",
              params: {
                groupId: groupDetails._id,
              },
            });
          } else if (name === "addexpense") {
            router.push({
              pathname: "/AddExpense",
              params: {
                groupId: groupDetails._id,
              },
            });
          }
        }}
        showBackground={false}
        position="right"
        distanceToEdge={20}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  noMembersContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    margin: 16
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "white",
  },
  oweSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 50,
  },
  billTitle: {
    fontSize: 16,
    color: "white",
  },
  billAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  splitTitle: {
    fontSize: 16,
    color: "white",
  },
  splitMembersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitMembers: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  verticalLine: {
    width: 1,
    height: "80%",
    backgroundColor: "white",
    opacity: 0.5,
  },
  dividendSection: {
    margin: 12,
    padding: 16,
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerDividend: {
    fontSize: 20,
    fontWeight: "600",
    color: "#16A34A",
    marginBottom: 12,
  },
  ownerOwe: {
    fontSize: 20,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    margin: 12,
    gap: 18,
  },
  buttonWrapper: {
    flex: 1,
  },
  settleupBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  exportBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  inviteBtn: {
    backgroundColor: "#FF9D00",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  inviteBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  inviteSection: {
    padding: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 12,
    paddingLeft: 16,
    paddingTop: 16,
    color: "white",
  },
  expensesContainer: {
    margin: 12,
    flexDirection: "row",
    gap: 14,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  expenses: {
    flexDirection: "column",
  },
  expenseAmount: {
    fontSize: 14,
    color: "#64748b",
  },
  expenseDescription: {
    color: "white",
    fontSize: 18,
  },
  addedTotalCost: {
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "white",
  },
  settlementItem: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  settlementText: {
    fontSize: 16,
    color: "white",
  },
  debtorName: {
    fontWeight: "600",
    color: "#EF4444",
  },
  creditorName: {
    fontWeight: "600",
    color: "#10B981",
  },
  settlementAmount: {
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshIndicator: {
    marginLeft: 8,
  },
  refreshText: {
    fontSize: 16,
    color: "white",
  },
});

export default GroupDetails;
