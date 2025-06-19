import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../../src/firebaseConfig";

interface Group {
  _id: string;
  name: string;
  image: any;
  totalExpense: number;
  members: any[];
  colors?: [string, string];
}

const Groups = () => {
  const { groups, isLoading, error, refreshGroups } = useGroups();
  const [user, setUser] = useState<User | null>(null);
  // const [colors, setColors] = useState<[string, string]>(["", ""]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        refreshGroups(); // Initial fetch when user is authenticated
      } else {
        setUser(null);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [refreshGroups]);

  // function getRandomColor() {
  //   const letters = '0123456789ABCDEF';
  //   let color = '#';
  //   for (let i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }
  // const randomizeGradient = () => {
  //   setColors([getRandomColor(), getRandomColor()]);
  // };

  // useEffect(() => {
  //   randomizeGradient();
  // },[])

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
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.totalExpense}>Total Expense: ${item.totalExpense.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
   <LinearGradient
      colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
      style={styles.safeAreaView}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    // backgroundColor: 'white',
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 16,
  },
  recentGroupList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
    fontWeight: "500",
  },
  totalExpense: {
    fontSize: 14,
    color: '#64748b',
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  createBtn: {
    color: "white",
    fontWeight: "500",
  },
  topBarTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
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
    color: "#64748b",
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
