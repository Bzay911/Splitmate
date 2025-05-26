import {
  View,
  Text,
  SafeAreaView,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import dummyProfile from "../../assets/images/dummyProfile.png";

const Groups = () => {
  // Dummy data for recent groups
  const recentGroups = [
    {
      id: "1",
      name: "Friends Trip",
      image: dummyProfile,
      totalExpense: 250,
      members: [],
    },
    {
      id: "2",
      name: "Office Lunch",
      image: dummyProfile,
      totalExpense: 150,
      members: [],
    },
    {
      id: "3",
      name: "Family Dinner",
      image: dummyProfile,
      totalExpense: 300,
      members: [],
    },
    {
      id: "4",
      name: "Birthday Bash",
      image: dummyProfile,
      totalExpense: 500,
      members: [],
    },
    {
      id: "5",
      name: "Weekend Getaway",
      image: dummyProfile,
      totalExpense: 420,
      members: [],
    },
    {
      id: "6",
      name: "Team Outing",
      image: dummyProfile,
      totalExpense: 380,
      members: [],
    },
    {
      id: "7",
      name: "Roommates Rent",
      image: dummyProfile,
      totalExpense: 1200,
      members: [],
    },
    {
      id: "8",
      name: "Festival Shopping",
      image: dummyProfile,
      totalExpense: 700,
      members: [],
    },
    {
      id: "9",
      name: "Road Trip",
      image: dummyProfile,
      totalExpense: 950,
      members: [],
    },
    {
      id: "10",
      name: "College Reunion",
      image: dummyProfile,
      totalExpense: 1100,
      members: [],
    },
  ];

  const renderRecentGroup = ({ item }) => {
    return (
      <View style={styles.renderRecentGroupSection}>
        <Image style={styles.groupImage} source={item.image} />
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}> {item.name}</Text>
          <Text>Total Expense: ${item.totalExpense}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topSection}>
        <View style={{ width: 90 }} />
        <Text style={styles.topBarTitle}>All Groups</Text>
        <Link href="/CreateGroup">
          <Text style={styles.createBtn}>Create New Group</Text>
        </Link>
      </View>

      {recentGroups.length === 0 ? (
        <View style={styles.noGroupsContainer}>
    <Image
      source={require("../../assets/images/noGroups.png")}
      style={styles.noGroups}
    />
    <Text style={styles.noGroupsText}>No groups joined</Text>
  </View>
      ) : (
        <FlatList
          data={recentGroups}
          renderItem={renderRecentGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recentGroupList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  recentGroupSection: {
    height: 250,
    width: "100%",
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 24,
    padding: 12,
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D9D9D9",
    padding: 12,
    borderRadius: 8,
  },
  groupImage: {
    width: 60,
    height: 60,
    padding: 8,
  },
  recentGroupList: {
    padding: 12,
    gap: 12,
    paddingBottom: 26,
  },
  groupDetails: {
    gap: 12,
  },
  groupName: {
    fontWeight: "600",
    fontSize: 16,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  createBtn: {
    color: "#007AFF",
    fontWeight: "500",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noGroups: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
  },
  noGroupsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noGroupsText:{
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
  }
});

export default Groups;
