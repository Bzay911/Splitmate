import { useActivity } from "@/contexts/ActivityContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";

const History = () => {
  const { activities, isLoading, refreshActivities } = useActivity();
  const {height} = Dimensions.get('window');
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filters = ["All", "Expenses", "Settlements", "Groups", "Members"];

  // Filter activities based on selected chip
  const getFilteredActivities = () => {
    if (selectedFilter === "All") return activities;

    return activities.filter((item) => {
      const message = item?.message?.toLowerCase() || "";

      switch (selectedFilter) {
        case "Expenses":
          return (
            message.includes("expense")
          );
        case "Settlements":
          return (
            message.includes("settlement") ||
            message.includes("settled up") ||
            message.includes("payment")
          );
        case "Groups":
          return message.includes("group") || message.includes("created");
        case "Members":
          return (
            message.includes("member") ||
            message.includes("joined") ||
            message.includes("left")
          );
        default:
          return true;
      }
    });
  };

  const filteredActivities = getFilteredActivities();

  const renderActivity = ({ item }: { item: any }) => {
    // Add null check for item
    if (!item) {
      console.log("Item is undefined");
      return null;
    }

    return (
      <View style={styles.activityItem}>
        <View style={styles.activity}>
          <Ionicons name="time-outline" size={18} color="black" />
          <View style={styles.activityContent}>
            <Text
              style={styles.activityMessage}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {item.message || "No activity"}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp
                ? new Date(item.timestamp).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "No date"}
              {" at "}
              {item.timestamp
                ? new Date(item.timestamp).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "No time"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Show loading state
  if (isLoading && activities.length === 0) {
    return (
      <LinearGradient
        colors={["#2a2a2a", "#1a1a1a", "#0f0f0f"]}
        style={styles.safeAreaView}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.topSection}>
            <Text style={styles.topBarTitle}>Activity</Text>
          </View>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#fccc28" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show empty state
  if (activities.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.topSection}>
          <Text style={styles.topBarTitle}>Activity</Text>
        </View>
        <View style={styles.centerContent}>
          <Feather name="trending-up" size={64} color="gray" />
          <Text style={styles.emptyText}>No activities yet</Text>
          <Text style={styles.subEmptyText}>
            Your expense activites will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topSection}>
        <Text style={styles.topBarTitle}>Activity</Text>
      </View>

      <View style={{ paddingBottom: 120 }}>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.chip,
                selectedFilter === filter && styles.chipSelected,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedFilter === filter && styles.chipTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredActivities}
          renderItem={renderActivity}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshActivities}
              tintColor="#fccc28"
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={[styles.centerContent, {height: height - 200}]}>
              <Text style={styles.emptyText}>
                No {selectedFilter.toLowerCase()} found
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  topBarTitle: {
    fontSize: 22,
    marginBottom: 8,
    fontFamily: "Inter-Medium"
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    height: 36,
  },
  chipSelected: {
    backgroundColor: "#fccc28",
    borderColor: "#fccc28",
  },
  chipText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter-Regular"
  },
  chipTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityMessage: {
    fontSize: 14,
    marginBottom: 4,
    flexWrap: "wrap",
    fontFamily: "Inter-Regular"
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    marginBottom: 4
  },
  subEmptyText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
    fontFamily: "Inter-Regular"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  activityItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  activity: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
    flexWrap: "wrap",
    fontFamily: "Inter-Regular"
  },
});

export default History;
