import { apiUrl } from "../constants/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const handlePostSignupInvites = async (email: string) => {
  try {
    const authToken = await AsyncStorage.getItem("token");
    const response = await fetch(apiUrl("invite/checkPendingInvite"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.message);
    }
    const data = await response.json();
    console.log("Pending invites claimed, ", data);
  } catch (err) {
    console.error("Error claiming the pending invites:", err);
  }
};
