import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOutPress = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        "Error",
        "Failed to sign out. Please try again."
      );
    }
  };

  const handleEditProfilePress = () => {
    router.push('/EditProfile');
  };

  const handleThemePress = () => {
    Alert.alert('Under Development!', 'This feature is not available yet.');
  };

  const handleNotificationsPress = () => {
    Alert.alert('Under Development!', 'This feature is not available yet.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('../../../assets/images/cat.png')}
            style={styles.avatarImage} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfilePress}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleNotificationsPress}>
          <MaterialIcons name="notifications" size={24} color="#64748b" />
          <Text style={styles.settingText}>Notifications</Text>
          <MaterialIcons name="chevron-right" size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleThemePress}>
          <MaterialIcons name="color-lens" size={24} color="#64748b" />
          <Text style={styles.settingText}>Theme</Text>
          <MaterialIcons name="chevron-right" size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOutPress}>
          <MaterialIcons name="logout" size={24} color="#ef4444" />
          <Text style={[styles.settingText, { color: '#ef4444' }]}>Sign Out</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black'
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 4,
    fontFamily: "Inter-Medium"
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    fontFamily: "Inter-Regular"
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  userInfo: {
    flexDirection: 'column',
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    color: 'white',
    marginBottom: 4,
    fontFamily: "Inter-Medium"
  },
  userEmail: {
    fontSize: 14,
    color: 'white',
    fontFamily: "Inter-Regular"
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    minWidth: 80,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: "Inter-Regular" 
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: "Inter-Medium",
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 16,
    fontFamily: "Inter-Regular"
  },
});

export default Profile;