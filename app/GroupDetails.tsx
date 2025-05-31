import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
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

interface InviteFormData {
  inviteeEmail: string;
}

const GroupDetails = () => {
  const { groupId, groupName, totalExpense, image } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [inviteeEmail, setInviteeEmail] = useState("");
const [isInviting, setIsInviting] = useState(false);

const handleInviteUser = async() => {
  if(!inviteeEmail || !inviteeEmail.includes("@")) {
    Alert.alert("Invalid Email", "Please enter a valid email address");
    return;
  }
  setIsInviting(true);
  const user = auth.currentUser;
  try{
    const token = await user?.getIdToken();
    const response = await fetch(`http://192.168.1.12:3000/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId: groupId,
        inviteeEmail: inviteeEmail,
      }),
    });

    if(!response.ok){
      throw new Error("Failed to invite user");
    }

    Alert.alert("Invitation Sent", "Invitation has been sent to the user");
    setInviteeEmail("");
  } catch (error) {
    console.error("Error inviting user:", error);
    Alert.alert("Error", "Failed to invite user");
  } finally {
    setIsInviting(false);
  }
};

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const user = auth.currentUser;
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

  return (
    groupDetails.members.length > 0 ? (  <SafeAreaView style={styles.container}>
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
      <View style={styles.oweSection}>
        <View>
          <Text style={styles.billTitle}>Total Expense</Text>
          <Text style={styles.billAmount}>{totalExpense}</Text>
        </View>

        <View style={styles.verticalLine} />

        <View>
          <Text style={styles.splitTitle}>Split Between</Text>
          <Text style={styles.splitMembers}>{groupDetails.members.length}</Text>
        </View>
      </View>

      <View style={styles.dividendSection}>
        <Text style={styles.ownerDividend}>You are owed $100 overall</Text>
        <Text style={styles.matesDividend}>
          Alex owes you <Text style={styles.money}>$30</Text>
        </Text>
        <Text style={styles.matesDividend}>
          Mathew owes you <Text style={styles.money}>$70</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.settleupBtn}>
          <Text style={styles.buttonText}>Settle up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.buttonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Group Members</Text>
        {groupDetails.members.map((member) => (
          <View key={member._id} style={styles.memberItem}>
            <Text style={styles.memberName}>{member.displayName}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
        ))}
      </View>
      {/* Add more group details here */}
    </SafeAreaView> ) : (
    <SafeAreaView style={styles.noMembersContainer}>
      <Text style={styles.errorText}>No members in this group</Text>
      <View style={styles.inviteSection}>
    <Text style={styles.sectionTitle}>Invite Members</Text>
    <TextInput
      style={styles.emailInput}
      placeholder="Enter email address"
      value={inviteeEmail}
      onChangeText={setInviteeEmail}
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <TouchableOpacity 
      style={[styles.inviteBtn, isInviting && styles.inviteBtnDisabled]}
      onPress={handleInviteUser}
      disabled={isInviting}
    >
      <Text style={styles.inviteBtnText}>
        {isInviting ? 'Sending...' : 'Send Invitation'}
      </Text>
    </TouchableOpacity>
  </View>
    </SafeAreaView>
  )
);
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#fff",
  },
  noMembersContainer:{
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
    backgroundColor: "#9DF144",
    height: 100,
    margin: 12,
    borderRadius: 8,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  billTitle: {
    fontSize: 16,
  },
  billAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  splitTitle: {
    fontSize: 16,
  },
  splitMembers: {
    fontSize: 32,
    fontWeight: "bold",
  },
  verticalLine: {
    width: 1,
    height: "80%",
    backgroundColor: "#000",
  },
  dividendSection: {
    marginLeft: 12,
    marginRight: 12,
    padding: 12,
  },
  ownerDividend: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
  matesDividend: {
    fontSize: 16,
  },
  money: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    margin: 12,
    gap: 18,
  },
  settleupBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
  },
  exportBtn: {
    backgroundColor: "#FF9D00",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  inviteBtn:{
    backgroundColor: "#FF9D00",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  inviteBtnText:{
    color: "white",
    fontWeight: "bold",
  },
  inviteSection: {
    padding: 16,
    marginTop: 20,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
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
  memberName: {
    fontSize: 16,
  },
  memberEmail: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});

export default GroupDetails;
