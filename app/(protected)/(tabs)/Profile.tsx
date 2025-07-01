import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
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

  const handleEditProfile = () => {
    router.push('/EditProfile');
  };

  const handlePrivacy = () => {
    Alert.alert('Under Development!', 'This feature is not available yet.');
  };

  const handleNotifications = () => {
    Alert.alert('Under Development!', 'This feature is not available yet.');
  };

  return (
    <LinearGradient
    colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image 
            source={user?.profilePicture ? { uri: user.profilePicture } : require('../../../assets/images/cat.png')} 
            style={styles.avatarImage} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
          <MaterialIcons name="notifications" size={24} color="#64748b" />
          <Text style={styles.settingText}>Notifications</Text>
          <MaterialIcons name="chevron-right" size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
          <MaterialIcons name="lock" size={24} color="#64748b" />
          <Text style={styles.settingText}>Privacy</Text>
          <MaterialIcons name="chevron-right" size={24} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="#ef4444" />
          <Text style={[styles.settingText, { color: '#ef4444' }]}>Sign Out</Text>
          <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
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
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
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
    fontWeight: '500',
    color: 'white', 
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginVertical: 16,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'white',
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
  },
});

export default Profile;