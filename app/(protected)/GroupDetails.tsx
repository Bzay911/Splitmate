import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useGroups } from "@/contexts/GroupsContext";
import Dialog from "react-native-dialog";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useDeleteExpense } from "@/utils/HandleDelete";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";


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

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options);
};

const formatBalance = (balance: number) => {
  if (Math.abs(balance) < 0.01) {
    return "0.00";
  }
  return Math.abs(balance).toFixed(2);
};

const isSettled = (balance: number) => {
  return Math.abs(balance) < 0.01;
};

const GroupDetails = () => {
  const { groupId, groupName, colors } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();
  const { groups } = useGroups();
  const { expenses, fetchExpenses, creditors, debtors, whoNeedsToPayWhom, clearExpenseData } =
    useExpense();
  const handleDelete = useDeleteExpense();
  const swipeableRef = useRef< typeof Swipeable>(null);

  const [visible, setVisible] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  

  const closeSwipe = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };

  const renderRightActions = (id: string, progress) => {
    // animated style for sliding in
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateX: interpolate(progress.value, [0, 1], [80, 0], "clamp"),
          },
        ],
      };
    });

    return (
      <Animated.View style={[styles.deleteButton, animatedStyle]}>
        <TouchableOpacity
          onPress={() => {
            setSelectedExpenseId(id);
            setVisible(true);
          }}
        >
          <Ionicons name="trash" size={24} color="white" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const parsedColors =
    typeof colors === "string" ? colors.split(",") : ["#6366f1", "#818cf8"];

  useEffect(() => {
    if (groups.length > 0 && groupId) {
      const currentGroup = groups.find((g) => g._id === groupId);
      if (currentGroup && groupDetails) {
        // If the member count has changed, refresh the details
        if (currentGroup.members.length !== groupDetails.members.length) {
          fetchGroupDetails();
        }
      }
    }
  }, [groups, groupId, groupDetails]);

  // Fetch group details
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

  useEffect(() => {
    if (user) fetchGroupDetails();
  }, [fetchGroupDetails]);

  // Refetch data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && groupId) {
        clearExpenseData();
        fetchExpenses(groupId as string);
        fetchGroupDetails();
      }
    }, [fetchExpenses, user, groupId, fetchGroupDetails])
  );

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

  const handleSettleUp = () => {
    
    const allSettlements = whoNeedsToPayWhom();
    router.push({
      pathname: "/SettleUp",
      params: {
        groupId: groupDetails._id,
        groupName: groupDetails.name,
        settlements: JSON.stringify(allSettlements),
      },
    });
  };

  const handleExport = () => {
    Alert.alert("Under Development!", "This feature is not available yet.");
  };

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
      colors={["#000000ff", "#000000ff", "#0f0f0f"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      pointerEvents="box-none"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <LinearGradient
            colors={parsedColors as [string, string]}
            style={styles.header}
             pointerEvents="box-none"
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
            {(() => {
              const userCreditor = creditors.find(
                (item) => item.email === user?.email
              );
              const userDebtor = debtors.find(
                (item) => item.email === user?.email
              );

              if (userCreditor && !isSettled(userCreditor.balance)) {
                return (
                  <Text style={styles.ownerDividend}>
                    You are owed ${formatBalance(userCreditor.balance)} overall
                  </Text>
                );
              } else if (userDebtor && !isSettled(userDebtor.balance)) {
                return (
                  <Text style={styles.ownerOwe}>
                    You owe ${formatBalance(userDebtor.balance)} overall
                  </Text>
                );
              } else {
                return (
                  <Text style={styles.settlementText}>
                    You are all settled up!
                  </Text>
                );
              }
            })()}
            {renderSettlements()}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.settleupButtonWrapper}
              onPress={handleSettleUp}
            >
              <LinearGradient
                colors={["#EF4444", "#EC4899"]}
                style={styles.settleupBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Settle up</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleExport}
            >
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
            <Swipeable
              key={expense._id}
              renderRightActions={(progress) =>
                renderRightActions(expense._id, progress)
              }
              ref={(ref) => {
                if (ref) {
                  swipeableRef.current = ref;
                }
              }}
              onSwipeableOpen={closeSwipe}
            >
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/ExpenseDetails",
                    params: {
                      expenseId: expense._id,
                      groupId: groupDetails._id,
                      expenseDescription: expense.description,
                      expenseAmount: expense.amount,
                      paidBy: expense.paidBy
                        ? expense.paidBy.displayName
                        : "Anonymous",
                      paidByEmail: expense.paidBy ? expense.paidBy.email : null,
                      groupName: groupDetails.name,
                      createdAt: expense.createdAt
                        ? new Date(expense.createdAt).toISOString()
                        : null,
                      colors: colors,
                    },
                  });
                }}
              >
                <View key={expense._id} style={styles.expensesContainer}>
                  <View style={styles.expenseIcon}>
                    <Ionicons name="cart" size={18} color="black" />
                  </View>

                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>

                  <View style={styles.expenses}>
                    <Text style={styles.expenseDescription}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseAmount}>
                      {expense?.paidBy?.displayName || "Anonymous"} added{" "}
                      <Text style={styles.addedTotalCost}>
                        ${expense.amount}
                      </Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Swipeable>
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
                members: JSON.stringify(groupDetails.members),
              },
            });
          }
        }}
        showBackground={false}
        position="right"
        distanceToEdge={20}
      />

      {visible && (
        <Dialog.Container visible={visible} onBackdropPress={() => setVisible(false)}>
          <Dialog.Title style={{fontFamily: "Inter-Bold", color: "red"}}>Delete Expense</Dialog.Title>
          <Dialog.Description style={{fontFamily: "Inter-Regular"}}>
            Do you want to delete this expense? You cannot undo this action.
          </Dialog.Description>
          <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
          <Dialog.Button
            label="Delete"
            onPress={() => {
              if (selectedExpenseId)
                handleDelete(selectedExpenseId, groupId as string);
              setVisible(false);
              setSelectedExpenseId(null);
              closeSwipe();
            }}
          />
        </Dialog.Container>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    margin: 16,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    marginBottom: 8,
    color: "white",
    fontFamily: "Inter-Medium"
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
    fontFamily: "Inter-Regular"
  },
  billAmount: {
    fontSize: 32,
    color: "white",
    fontFamily: "Inter-Regular"
  },
  splitTitle: {
    fontSize: 16,
    color: "white",
    fontFamily: "Inter-Regular"
  },
  splitMembersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitMembers: {
    fontSize: 32,
    color: "white",
    fontFamily: "Inter-Regular"
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
  settleupButtonWrapper: {
    flex: 1,
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
    fontFamily: "Inter-Regular"
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
    marginBottom: 12,
    marginLeft: 12,
    paddingLeft: 16,
    paddingTop: 16,
    color: "white",
    fontFamily: "Inter-Regular"
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
    color: "gray",
    fontFamily: "Inter-Regular"
  },
  expenseDescription: {
    color: "white",
    fontSize: 18,
    fontFamily: "Inter-Regular"
  },
  addedTotalCost: {
    fontWeight: "bold",
    fontFamily: "Inter-Regular"
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "white",
    fontFamily: "Inter-Regular"
  },
  settlementItem: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  settlementText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Inter-Regular"
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
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteText: {
    color: "white",
    fontFamily: "Inter-Regular"
  },
});

export default GroupDetails;
