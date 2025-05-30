import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GroupMember {
  name: string;
  phone: string;
}

interface GroupDetails {
  _id: string;
  name: string;
  image: string;
  totalExpense: number;
  members: GroupMember[];
}

const GroupDetails = () => {
  const { groupId, groupName, totalExpense, image } = useLocalSearchParams();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`http://192.168.1.12:3000/groups/${groupId}`);
        const data = await response.json();
        setGroupDetails(data.group);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  // console.log(groupDetails?.members.length);
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
          members: JSON.stringify(groupDetails.members)
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.settingsBtn} onPress={handleSettingsPress}>
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
        <Text style={styles.matesDividend}>Alex owes you <Text style={styles.money}>$30</Text></Text>
        <Text style={styles.matesDividend}>Mathew owes you <Text style={styles.money}>$70</Text></Text>
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
        {groupDetails.members.map((member, index) => (
          <View key={index} style={styles.memberItem}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberPhone}>{member.phone}</Text>
          </View>
        ))}
      </View>
      {/* Add more group details here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  settingsBtn:{
    alignSelf:'flex-end',
    margin:12
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
    height: '80%',
    backgroundColor: '#000',
  },
  dividendSection: {
    marginLeft: 12,
    marginRight: 12,
    padding: 12,
  },
  ownerDividend: {
    fontSize: 20,
    fontWeight: "bold",
    color:'green'
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
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GroupDetails;
