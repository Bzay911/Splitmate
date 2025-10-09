import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useGroups } from "@/contexts/GroupsContext";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface InviteMatesBtnProps {
    groupId: string;
}

const InviteMatesBtn: React.FC<InviteMatesBtnProps> = ({groupId}) => {

      const [inviteeEmail, setInviteeEmail] = useState("");
      const [isInviting, setIsInviting] = useState(false);
      const {refreshGroups} = useGroups();
      const {token} = useAuth();
      
      const showInviteInfo = () => {
        Alert.alert(
          "How to Invite Members",
          "• Enter the email address of the person you want to invite\n\n• If they already have an account, they'll be added immediately\n\n• If they don't have an account, they'll receive an invitation email\n\n• They can join the group by downloading the app and signing up",
          [{ text: "Got it!", style: "default" }]
        );
      };
      
      const handleInviteUser = async() => {
        if(!inviteeEmail || !inviteeEmail.includes("@")) {
          Alert.alert("Invalid Email", "Please enter a valid email address");
          return;
        }
        setIsInviting(true);
        try{
          const response = await fetch(apiUrl(`api/groups/${groupId}/addMember`), {
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
      
          const data = await response.json();
          if(!response.ok){
            throw new Error(data.error || "Failed to invite user");
          }
      
          Alert.alert("Success", data.message || "User has been added to the group successfully", [
            {
              text: "OK",
              onPress: async () => {
                // Refresh groups context to update member count
                await refreshGroups();
                setInviteeEmail("");
                router.back();
              }
            }
          ]);
        } catch (error) {
          console.error("Error inviting user:", error);
          Alert.alert("Error", "Failed to invite user");
        } finally {
          setIsInviting(false);
        }
      };
      
  return (
    <SafeAreaView>
      <View style={styles.inviteSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Invite Members</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={showInviteInfo}
          >
            <Ionicons name="help-circle" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.emailInput}
          placeholder="someone@gmail.com"
          placeholderTextColor="#64748b"
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
}
const styles = StyleSheet.create({
    inviteBtn:{
        backgroundColor: "#FF9D00",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
      },
      inviteBtnText:{
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        padding: 8,
      },
      inviteSection: {
        padding: 16,
      },
      emailInput: {
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: "white",
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
        color: "white",
      },
      titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      },
      infoButton: {
        padding: 8,
      },
})
export default InviteMatesBtn