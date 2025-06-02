import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/firebaseConfig";

interface Group {
  _id: string;
  name: string;
  image: any;
  totalExpense: number;
  members: any[];
}

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getGroups() {
      setIsLoading(true);
      try {
        // Get current user and token
        const user = auth.currentUser;
        if (!user) {
          router.replace("/"); // Redirect to login if no user
          return;
        }

        const token = await user.getIdToken();

        // Make authenticated request
        const response = await fetch("http://192.168.1.12:3000/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }, 
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch groups (${response.status})`);
        }

        const data = await response.json();
        setGroups(data.groups);
      } catch (error: any) {
        console.error("Error fetching groups:", error);
        setError(error.message);

        // Handle authentication errors
        if (error.code === "auth/user-token-expired") {
          router.replace("/"); // Redirect to login
        }
      } finally {
        setIsLoading(false);
      }
    }

    getGroups();
  }, []);

  // Add a refresh function
  const refreshGroups = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/");
        return;
      }

      const token = await user.getIdToken(true); // Force refresh token

      const response = await fetch("http://192.168.1.12:3000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups (${response.status})`);
      }

      const data = await response.json();
      setGroups(data.groups);
    } catch (error: any) {
      console.error("Error refreshing groups:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupPress = (group: Group) => {
    router.push({
      pathname: "/GroupDetails",
      params: {
        groupId: group._id,
        groupName: group.name,
        totalExpense: group.totalExpense,
        image: group.image,
      },
    });
  };

  const renderRecentGroup = ({ item }: { item: Group }) => {
    return (
      <TouchableOpacity
        style={styles.renderRecentGroupSection}
        onPress={() => handleGroupPress(item)}
      >
        <Image style={styles.groupImage} source={{ uri: item.image }} />
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text>Total Expense: ${item.totalExpense}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
   <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topSection}>
        {/* <View style={{ width: 90 }} /> */}
        <Text style={styles.topBarTitle}>All Groups</Text>
        <Link href="/CreateGroup">
          <Text style={styles.createBtn}>Create New Group</Text>
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
          <Image
            source={require("../../assets/images/noGroups.png")}
            style={styles.noGroups}
          />
          <Text style={styles.noGroupsText}>No groups joined</Text>
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
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, 
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
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
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
  noGroupsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Groups;
