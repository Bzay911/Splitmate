import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

// Define the Contact type
type Contact = Contacts.Contact;

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  // Add proper typing to the state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data);
        }
      }
    };
    fetchContacts();
  }, []);

  const handleCreate = async () => {
    // Validate group name
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    // Validate member selection
    if (selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one member");
      return;
    }
    try {
      const response = await fetch("http://192.168.1.12:3000/addGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          totalExpense: 0,
          members: selectedContacts.map((contact) => ({
            name: contact.name || "Unknown",
            phone: contact.phoneNumbers?.[0]?.number || "",
          })),
          image:
            "https://www.ibcs.com/wp-content/uploads/2024/01/Projekt-bez-nazwy-15.png",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create group");
      }
      const data = await response.json();
      console.log("Group created successfully");
      setGroupName("");
      router.back();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // Add type to the contact parameter
  const toggleContactSelection = (contact: Contact) => {
    if (selectedContacts.some((c) => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.input}
        placeholder="Enter Group Name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <TouchableOpacity
        style={styles.selectContactsBtn}
        onPress={() => setShowContacts(!showContacts)}
      >
        <Text style={styles.selectContactTitle}>Select Contacts</Text>
        <Ionicons name="chevron-down" size={24} color="white" />
      </TouchableOpacity>
      {showContacts && (
        <View style={styles.selectedContactsContainer}>
          <Text>Selected Contacts: {selectedContacts.length}</Text>
        </View>
      )}
      {showContacts && (
        <FlatList
          data={contacts}
          renderItem={({ item }: { item: Contact }) => (
            <>
              <TouchableOpacity
                style={[
                  styles.contactItem,
                  selectedContacts.some((c) => c.id === item.id) &&
                    styles.selectedContact,
                ]}
                onPress={() => toggleContactSelection(item)}
              >
                <Text style={styles.contactName}>{item.name || "Unknown"}</Text>
                {item.phoneNumbers?.[0]?.number && (
                  <Text style={styles.contactPhone}>
                    {item.phoneNumbers[0].number}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
          keyExtractor={(item: Contact) =>
            item.id || `contact-${Math.random()}`
          }
          style={styles.contactList}
        />
      )}
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 12,
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "gray",
    padding: 10,
    width: "80%",
    marginTop: 20,
  },
  createBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  createBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  selectContactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  contactList: {
    width: "100%",
    marginTop: 10,
  },
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedContact: {
    backgroundColor: "#e3f2fd",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  selectContactsBtn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  selectedContactsContainer: {
    alignSelf: "flex-start",
    margin: 10,
  },
});

export default CreateGroup;
