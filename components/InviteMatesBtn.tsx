import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { auth } from "../src/firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

interface InviteMatesBtnProps {
    groupId: string;
}

const InviteMatesBtn: React.FC<InviteMatesBtnProps> = ({groupId}) => {

    interface InviteFormData {
        inviteeEmail: string;
      }

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
      
          const data = await response.json();
          if(!response.ok){
            throw new Error(data.error || "Failed to invite user");
          }
      
          Alert.alert("Invitation Sent", data.message || "Invitation has been sent to the user");
          setInviteeEmail("");
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
})
export default InviteMatesBtn