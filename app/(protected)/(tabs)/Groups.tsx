import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Group } from "@/types/Group";

const Groups = () => {
  const { groups, error, isLoading, refreshGroups } = useGroups();
  
  const handleGroupPress = (group: Group) => {
    router.push({
      pathname: "/GroupDetails",
      params: {
        groupId: group._id,
        groupName: group.name,
        totalExpense: group.totalExpense,
        image: group.image,
        colors: group.colors,
      },
    });
  };

  const renderRecentGroup = ({ item }: { item: Group }) => {
    return (
      <TouchableOpacity
        style={styles.renderRecentGroupSection}
        onPress={() => handleGroupPress(item)}
      >
        <LinearGradient
          colors={item.colors ?? ['#6366f1', '#818cf8']}
          style={{
            height: 50,
            width: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="people" size={24} color="white" />
        </LinearGradient>
        <View>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.totalExpense}>Total Expense: ${item.totalExpense.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topSection}>
        <Text style={styles.topBarTitle}>All Groups</Text>
        <Link href="/CreateGroup">
          <Text style={styles.createBtn}>+ New Group</Text>
        </Link>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text>Loading groups...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshGroups}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.noGroupsContainer}>
             <Ionicons name="people" size={64} color="gray" />
           <Text style={styles.noGroupsText}>No groups yet</Text>
           <Text style={styles.noGroupssubText}>Create or join a group to start splitting with mates</Text>
            <Link href="/CreateGroup" style={styles.createBtnCenter}>
          <Text style={styles.createBtn}>Create New Group</Text>
        </Link>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderRecentGroup}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.recentGroupList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refreshGroups}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 16,
  },
  recentGroupList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  groupName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  totalExpense: {
    fontSize: 14,
    color: 'gray',
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  createBtn: {
    fontFamily: "Inter-Regular"
  },
  createBtnCenter: {
    backgroundColor: "#fccc28",
    padding: 12,
    borderRadius: 4
  },
  topBarTitle: {
    fontSize: 22,
    marginBottom: 8,
     fontFamily: "Inter-Medium"
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
    gap: 5
  },
  noGroupsText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    marginBottom: 4
  },
  noGroupssubText: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Inter-Regular",
    color: 'gray'
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Groups;
