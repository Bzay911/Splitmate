import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import { auth } from "../src/firebaseConfig";

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
}

interface Expense {
  _id: string;
  paidBy: GroupMember;
  amount: number;
  description: string;
  date: Date;
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
}



const GroupDetails = () => {
  const { groupId, groupName, image } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const user = auth.currentUser;
  const [dividend, setDividend] = useState<number>(0);

  useEffect(() => {
    if (groupDetails) {
      setDividend(calculateDividend(groupDetails.totalExpense, groupDetails.members.length));
    }
  }, [groupDetails]);
  
  useEffect(() => {
    // Fetching group details
    const fetchGroupDetails = async () => {
      if (!user) {
        router.push("/");
        return;
      }
      const token = await user.getIdToken();

      try {
        const response = await fetch(
          `http://192.168.1.12:3000/api/groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch group (${response.status})`);
        }

        const data = await response.json();
        setGroupDetails(data.group);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  useEffect(() => {
    // Fetching expenses
    const fetchExpenses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/");
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch(
          `http:/192.168.1.12:3000/api/groups/${groupId}/expenses`,
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
    };
    fetchExpenses();
  }, [expenses]);

  if (!groupDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Group not found</Text>
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

  const nonAdminMembers = groupDetails.members.filter(member => 
    member.email !== groupDetails?.createdBy.email
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.header}>
          <Image source={{ uri: image as string }} style={styles.groupImage} />
          <Text style={styles.groupName}>{groupName}</Text>
        </View>
        <LinearGradient
          colors={["#4ADE80", "#10B981"]}
          style={styles.oweSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View>
            <Text style={styles.billTitle}>Total Expense</Text>
            <Text style={styles.billAmount}>${groupDetails.totalExpense}</Text>
          </View>

          <View style={styles.verticalLine} />

          <View>
            <Text style={styles.splitTitle}>Split Between</Text>
            <Text style={styles.splitMembers}>
              {groupDetails.members.length}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.dividendSection}>
          <Text style={styles.ownerDividend}>You are owed $100 overall</Text>

          {nonAdminMembers.map((member) => {
            return (
              <View key={member._id} style={styles.memberOwesContainer}>
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <Ionicons name="person" size={24} color="#666" />
                  </View>
                  <View>
                    <Text style={styles.memberName}>
                      {member.displayName || "Anonymous"}
                    </Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </View>
                {dividend > 0 ? (
                  <Text style={styles.positiveAmount}> +{dividend}</Text>
                ) : (
                  <Text style={styles.negativeAmount}> -{dividend}</Text>
                )}
              </View>
            );
          })}
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

      <FloatingAction
        color="#007AFF"
        floatingIcon={<Ionicons name="add" size={24} color="white" />}
        onPressMain={() => {
          router.push({
            pathname: "/AddExpense",
            params: {
              groupId: groupDetails._id,
            },
          });
        }}
        showBackground={false}
        position="right"
        distanceToEdge={16}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  noMembersContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsBtn: {
    alignSelf: "flex-end",
    margin: 12,
  },
  header: {
    alignItems: "center",
    padding: 20,
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
  },
  totalExpense: {
    fontSize: 18,
    color: "#666",
  },
  oweSection: {
    height: 100,
    margin: 12,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
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
    backgroundColor: "white",
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
    marginBottom: 16,
  },
  memberOwesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
  },
  positiveAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A",
  },
  negativeAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
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
  emailInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inviteBtnDisabled: {
    opacity: 0.7,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 12,
    paddingLeft: 16,
    paddingTop: 16,
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
  },
  expenses: {
    flexDirection: "column",
  },
  expenseAmount: {
    fontSize: 14,
    color: "gray",
  },
  expenseDescription: {
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
    color: "#666",
  },
});

export default GroupDetails;
