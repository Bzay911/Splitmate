import { apiUrl } from "@/constants/ApiConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import InviteMatesBtn from "../../components/InviteMatesBtn";
import { useAuth } from "@/contexts/AuthContext";

interface GroupMember {
  _id: string;
  displayName: string;
  email: string;
}

interface GroupDetails {
  _id: string;
  name: string;
  createdBy: {
    _id: string;
    email: string;
    displayName: string;
  };
  members: GroupMember[];
}

const GroupSettings = () => {
  const { groupId, groupName, members } = useLocalSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const parsedMembers: GroupMember[] = JSON.parse(members as string);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const {user, token} = useAuth();
  
  useEffect(() => {
    // Fetching group details
    const fetchGroupDetails = async () => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(
          apiUrl(`api/groups/${groupId}`),
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

  // setting isAdmin to true if the user is the admin of the group
  useEffect(() => {
    if (groupDetails && user) {
      setIsAdmin(groupDetails.createdBy.email === user.email);
    }
  }, [groupDetails, user]);

  

  const handleDeleteGroup = async () => {
    if(!isAdmin){
      Alert.alert("Error", "You are not the admin of this group");
      return;
    }
    
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
              const response = await fetch(
                apiUrl(`api/groups/${groupId}`),
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

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
                      router.replace("/(protected)/(tabs)/Groups");
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
      {item.email === groupDetails?.createdBy.email && (
        <LinearGradient
          colors={["#4ADE80", "#10B981"]}
          style={styles.adminContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.adminText}>Admin</Text>
        </LinearGradient>
      )}
    </View>
  );

  return (
    <LinearGradient
    colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.title}>{groupName}</Text>
        <Text style={styles.subtitle}>Group Members ({parsedMembers.length})</Text>
      </View>
      <View style={styles.membersContainer}>
        <FlatList
          data={parsedMembers}
          renderItem={renderMember}
          keyExtractor={(item, index) => `${item.email}-${index}`}
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
    </LinearGradient>
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
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "white",
  },
  membersList: {
    padding: 16,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: "white",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "white",
  },
  memberPhone: {
    fontSize: 14,
    color: "white",
  },
  membersContainer: {
    padding: 8,
  },
  deleteSection: {
    padding: 16,
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
  adminContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "red",
    borderRadius: 8,
    padding: 4,
  },
  adminText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  }
});

export default GroupSettings;
