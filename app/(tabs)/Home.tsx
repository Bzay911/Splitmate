import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dummyProfile from "../../assets/images/dummyProfile.png";
import GroupsContext from "@/contexts/GroupsContext";
import { useContext } from "react";

export default function HomeScreen() {
  const { groups } = useContext(GroupsContext);
  // Dummy data for splitmates
  const Splitmates = [
    {
      id: "1",
      name: "John Doe",
      image: dummyProfile,
    },
    {
      id: "2",
      name: "Jane Smith",
      image: dummyProfile,
    },
    {
      id: "3",
      name: "Alice Johnson",
      image: dummyProfile,
    },
    {
      id: "4",
      name: "Bob Brown",
      image: dummyProfile,
    },
    {
      id: "5",
      name: "Larry Wheels",
      image: dummyProfile,
    },
    {
      id: "6",
      name: "Osma BinLaden",
      image: dummyProfile,
    },
    {
      id: "7",
      name: "Tony Stark",
      image: dummyProfile,
    },
    {
      id: "8",
      name: "Bruce Wayne",
      image: dummyProfile,
    },
  ];

  const renderSplitmate = ({ item }) => {
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

  const renderRecentGroup = ({ item }) => {
    return (
      <View style={styles.renderRecentGroupSection}>
        <Image style={styles.groupImage} source={item.image} />
        <View style={styles.groupDetails}>
          <Text style={styles.groupName}> {item.name}</Text>
          <Text>Total Expense: ${item.totalExpense}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Topbar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Home</Text>

        <View style={styles.rightTop}>
          <Ionicons size={28} name="scan" style={styles.iconSpacing} />
          <Ionicons size={28} name="notifications" />
        </View>
      </View>

      {/* Owe section */}
      <View style={styles.amountSection}>
        <View style={styles.oweSection}>
          <Text style={styles.amountTitle}>I'm owed</Text>
          <Text style={styles.amount}>$200</Text>
        </View>
        <View style={styles.amountSubSection}>
          <View style={styles.paySection}>
            <Text style={styles.amountTitle}>Need to pay</Text>
            <Text style={styles.amount}>-$12</Text>
          </View>
          <View style={styles.expenseSection}>
            <Text style={styles.amountTitle}>Total expenses</Text>
            <Text style={styles.amount}>$1230</Text>
          </View>
        </View>
      </View>

      {/* Splitmates */}
      <View style={styles.splitMatesContainer}>
        <View style={styles.texts}>
          <Text style={styles.eachTitle}>Your Splitmates</Text>
          <Text>see all</Text>
        </View>

        <FlatList
          data={Splitmates}
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
        <FlatList
          data={groups}
          renderItem={renderRecentGroup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recentGroupList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
  },
  rightTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 10,
  },
  amountSection: {
    height: 250,
    width: "100%",
    // borderWidth: 2,
    borderRadius: 8,
    marginTop: 24,
  },
  oweSection: {
    backgroundColor: "#9DF144",
    height: 100,
    margin: 12,
    borderRadius: 8,
    padding: 12,
  },
  amountSubSection: {
    flexDirection: "row",
    gap: 12,
  },
  paySection: {
    backgroundColor: "#FE8888",
    height: 100,
    width: 180,
    marginLeft: 12,
    borderRadius: 8,
    padding: 12,
  },
  expenseSection: {
    backgroundColor: "#D5D5D5",
    height: 100,
    width: 180,
    borderRadius: 8,
    padding: 12,
  },
  splitMatesContainer: {
    height: 160,
    width: "100%",
    // borderWidth: 2,
    borderRadius: 8,
    marginTop: 24,
    padding: 12,
    backgroundColor: "#D9D9D9",
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
    gap: 16,
    marginTop: 12,
  },
  splitmateName: {
    textAlign: "center",
    marginTop: 4,
  },
  recentGroupSection: {
    height: 250,
    width: "100%",
    // borderWidth: 2,
    borderRadius: 8,
    marginTop: 24,
    padding: 12,
  },
  renderRecentGroupSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D9D9D9",
    padding: 12,
    borderRadius: 8,
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
});
