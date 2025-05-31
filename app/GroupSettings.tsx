import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import  InviteMatesBtn  from "../components/InviteMatesBtn";

interface GroupMember {
  _id: string;
  displayName: string;
  email: string;
}

const GroupSettings = () => {
  const { groupId, groupName, members } = useLocalSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const parsedMembers: GroupMember[] = JSON.parse(members as string);

  const handleDeleteGroup = async () => {
    // Show confirmation dialog
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`http://192.168.1.12:3000/groups/${groupId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete group');
              }

              // Show success message
              Alert.alert(
                "Success",
                "Group deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate back to groups list
                      router.replace("/(tabs)/Groups");
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert(
                "Error",
                "Failed to delete group. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.displayName}</Text>
        <Text style={styles.memberPhone}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{groupName}</Text>
        <Text style={styles.subtitle}>Group Members ({parsedMembers.length})</Text>
      </View>
      <View style={styles.membersContainer}>
        <FlatList
          data={parsedMembers}
          renderItem={renderMember}
          keyExtractor={(item, index) => `${item.phone}-${index}`}
          contentContainerStyle={styles.membersList}
        />
      </View>
      <InviteMatesBtn groupId={groupId as string} />
      <View style={styles.deleteSection}>
        <TouchableOpacity 
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]} 
          onPress={handleDeleteGroup}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Delete Group</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  membersList: {
    padding: 16,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: "#666",
  },
  membersContainer: {
    paddingLeft: 16,
  },
  deleteSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupSettings;
