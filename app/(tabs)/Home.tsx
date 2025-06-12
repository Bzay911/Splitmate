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
}

export default function HomeScreen() {
  const { financialSummary, refreshFinancialSummary } = useFinancial();
  const { user } = useAuth();
  const { groups, refreshGroups } = useContext(GroupsContext);
  const [splitmates, setSplitmates] = useState<Splitmate[]>([]);

  useEffect(() => {
    if (user) {
      refreshFinancialSummary();
      refreshGroups();
    }
  }, [user, refreshFinancialSummary, refreshGroups]);

  useEffect(() => {
    const fetchSplitmates = async () =>{
      if (!user) return;
      try{
        const token = await user.getIdToken();
        const response = await fetch(apiUrl(`api/auth/splitmates`), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch splitmates (${response.status})`);
        }

        const data = await response.json();
        if (data.splitmates && data.splitmates.length > 0) {
          // Transform the data to match your component's needs
          const formattedSplitmates = data.splitmates.map((splitmate: any) => ({
            id: splitmate.id,
            name: splitmate.name,
            image: require('../../assets/images/dummyProfile.png') // Use default image for now
          }));
          setSplitmates(formattedSplitmates);
        }
      } catch (error) {
        console.error("Error fetching splitmates:", error);
      }
    }
    fetchSplitmates();
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
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView style={styles.scrollView}>
      {/* Topbar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Home</Text>

        <View style={styles.rightTop}>
          <Ionicons size={28} name="menu" />
        </View>
      </View>

      {/* Owe section */}
      <View style={styles.amountSection}>
        <LinearGradient
          colors={["#4ADE80", "#10B981"]}
          style={styles.oweSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.amountTitle}>I'm owed</Text>
          <Text style={styles.amount}>
            ${financialSummary.creditAmount.toFixed(2)}
          </Text>
        </LinearGradient>

        <View style={styles.amountSubSection}>
          <LinearGradient
            colors={["#FF6B6B", "#FE8888", "#FFA9A9"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.paySection}
          >
            <Text style={styles.amountTitle}>Need to pay</Text>
            <Text style={styles.amount}>
              -${financialSummary.debtAmount.toFixed(2)}
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={["#CFCFCF", "#D5D5D5", "#E0E0E0"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.expenseSection}
          >
            <Text style={styles.amountTitle}>Total expenses</Text>
            <Text style={styles.amount}>
              ${financialSummary.totalExpenses.toFixed(2)}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Splitmates */}
      <View style={styles.splitMatesContainer}>
        <View style={styles.texts}>
          <Text style={styles.eachTitle}>Your Splitmates</Text>
          <Text>see all</Text>
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
          <Text>see all</Text>
        </View>
          {groups.map((item) => (
            <TouchableOpacity key={item._id} onPress={() => handleGroupPress(item)}>
    <View key={item._id} style={styles.renderRecentGroupSection}>
      <Image style={styles.groupImage} source={{ uri: item.image }} />
      <View style={styles.groupDetails}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text>Total Expense: ${item.totalExpense.toFixed(2)}</Text>
      </View>
    </View>
    </TouchableOpacity>
  ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
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
    marginTop: 24,
  },
  oweSection: {
    height: 100,
    margin: 12,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
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
  },
  expenseSection: {
    height: 100,
    flex: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
  },
  splitMatesContainer: {
    height: 160,
    width: "100%",
    marginTop: 24,
    padding: 12,
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
  },
  recentGroupSection: {
    width: "100%",
    borderRadius: 8,
    marginTop: 24,
    padding: 12,
    paddingBottom: 30,
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D9D9D9",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  groupImage: {
    width: 60,
    height: 60,
    padding: 8,
  },
  recentGroupList: {
    padding: 12,
    gap: 12,
  },
  groupDetails: {
    gap: 12,
  },
  groupName: {
    fontWeight: "600",
    fontSize: 16,
  },
  eachTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  amountTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  amount: {
    fontWeight: "600",
    fontSize: 35,
  },
  recentGroupHeader: {
    padding: 12,
    marginTop: 24,
  },
});
