import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { apiUrl } from '../../constants/ApiConfig';

export default function JoinGroup() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const {groupId, email, token} = params;

  useEffect(() => {
    const joinGroup = async () => {
      console.log("JoinGroup params:", { groupId, email, token });
      const authToken = await AsyncStorage.getItem("token");
       if (!authToken || !groupId || !token || !email) return;
      if (authToken) {
        try {
          const response = await fetch(apiUrl("invite/acceptInvite"),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ groupId, token }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to join the group");
          }

          Alert.alert("Success", "You are added to the group!");
          router.replace("/");
        } catch (err) {
          console.log("Fetch error:", err.message);
          router.replace("/");
        }
      } else {
        router.replace("/SignIn");
      }
    };

    if (groupId) joinGroup();
  }, [groupId]);

  return null;
}
