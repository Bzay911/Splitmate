import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancial } from "@/contexts/FinancialContext";
import GroupsContext from "@/contexts/GroupsContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Add these interfaces
interface Splitmate {
  id: string;
  name: string;
  image: any;
}

interface Group {
  _id: string;
  name: string;
  image: string;
  totalExpense: number;
  colors?: [string, string];
}

export default function HomeScreen() {
  const { financialSummary, refreshFinancialSummary } = useFinancial();
  const { user, token } = useAuth();
  const { groups, refreshGroups } = useContext(GroupsContext);
  const [splitmates, setSplitmates] = useState<Splitmate[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      await refreshFinancialSummary();
      await refreshGroups();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSplitmates = async () => {
      if (!user) return;
      
      try {
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        const response = await fetch(apiUrl(`api/auth/splitmates`), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch splitmates (${response.status})`);
        }

        const data = await response.json();
        if (data.splitmates && data.splitmates.length > 0) {
          const formattedSplitmates = data.splitmates.map((splitmate: any) => ({
            id: splitmate.id,
            name: splitmate.name,
            image: splitmate.image && splitmate.image.trim() && splitmate.image !== 'null'
              ? { uri: splitmate.image } 
              : require('../../../assets/images/cat.png')
          }));
          setSplitmates(formattedSplitmates);
        } else {
          setSplitmates([]); // Set empty array if no splitmates
        }
      } catch (error) {
        console.error("Error fetching splitmates:", error);
        setSplitmates([]); // Set empty array on error
      }
    };

    if (user) {
      fetchSplitmates();
    }
  }, [user]);

  const renderSplitmate = ({ item }: { item: Splitmate }) => {
    return (
      <View>
        <Image style={styles.splitmateImage} source={item.image} />
        <Text style={styles.splitmateName}>
          {" "}
          {item.name.split(" ").join("\n")}
        </Text>
      </View>
    );
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

  return (
     <LinearGradient
      colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
      style={styles.mainContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Topbar */}
      <View style={styles.topBar}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Welcome back,</Text>
          <Text style={styles.username}>{user?.displayName || 'User'}</Text>
        </View>

        <View style={styles.rightTop}>
          <TouchableOpacity onPress={() => router.push('/Profile')}>
            <Image 
              source={user?.profilePicture ? { uri: user.profilePicture } : require('../../../assets/images/cat.png')} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Owe section */}
      <View style={styles.amountSection}>
        <View style={styles.oweSection}>
          <Text style={styles.amountTitle}>I'm owed</Text>
          <Text style={styles.amount}>
            ${financialSummary?.creditAmount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.amountSubSection}>
          <View style={styles.paySection}>
            <Text style={styles.amountTitle}>Need to pay</Text>
            <Text style={styles.amount}>
              -${financialSummary?.debtAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.expenseSection}>
            <Text style={styles.amountTitle}>Total expenses</Text>
            <Text style={styles.amount}>
              ${financialSummary?.totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Splitmates */}
      <View style={styles.splitMatesContainer}>
        <View style={styles.texts}>
          <Text style={styles.eachTitle}>Your Splitmates</Text>
          <Text style={styles.seeAll}>see all</Text>
        </View>

        <FlatList
          data={splitmates}
          renderItem={renderSplitmate}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.splitmatesList}
        />
      </View>

      {/* Recent Group Section */}
      <View style={styles.recentGroupSection}>
        <View style={styles.texts}>
          <Text style={styles.eachTitle}>Recent Groups</Text>
          <Text style={styles.seeAll}>see all</Text>
        </View>
          {groups.slice(0, 3).map((item) => (
            <TouchableOpacity key={item._id} onPress={() => handleGroupPress(item)}>
              <View style={styles.renderRecentGroupSection}>
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
              </View>
            </TouchableOpacity>
          ))}
      </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 100,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  camera: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
  },
  username: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  title: {
    fontSize: 22,
    color: "white",
  },
  rightTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 16,
  },
  amountSection: {
    height: 250,
    width: "100%",
    borderRadius: 8,
    marginTop: 12,
  },
  oweSection: {
    height: 100,
    margin: 12,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#fccc28",
  },
  amountSubSection: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    paddingHorizontal: 12,
  },
  paySection: {
    height: 100,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fccc28",
  },
  expenseSection: {
    height: 100,
    flex: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#fccc28",
  },
  splitMatesContainer: {
    height: 160,
    width: "100%",
    marginTop: 12,
    padding: 12,
    paddingBottom: 0,
  },
  texts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  splitmateImage: {
    width: 60,
    height: 60,
    borderRadius: 25,
  },
  splitmatesList: {
    gap: 22,
    marginTop: 12,
  },
  splitmateName: {
    textAlign: "center",
    marginTop: 4,
    color: 'white',
  },
  recentGroupSection: {
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 16,
    
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    color: '#94a3b8',
  },
  eachTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: 'white',
  },
  amountTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    // color: "white"
  },
  amount: {
    fontWeight: "600",
    fontSize: 35,
    // color: "white"
  },
  recentGroupHeader: {
    padding: 12,
    marginTop: 24,
  },
  seeAll: {
    color: 'white',
    fontSize: 14,
  },
});
