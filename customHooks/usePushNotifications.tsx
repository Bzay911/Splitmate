import { useEffect, useState } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,      
    shouldSetBadge: true,        
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();


  async function registerForPushNotificationAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })

      if(Platform.OS === 'android'){
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C'
        });
      }
      
      return token;
    } else {
      console.log("Error, Please use a physical device not an emulator");
    }
  }

  useEffect(() => {
    registerForPushNotificationAsync().then((token) => {
        setExpoPushToken(token);
    });

        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log("📱 Notification received in foreground:", notification);
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // not working for now
      console.log("👆 Notification tapped:", response);
      const data = response.notification.request.content.data;
      console.log(data);
      if(data.screen === "notifications"){
        router.push('/(protected)/(tabs)/History')
      }
      console.log(response);
    });

  return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [])
console.log("Expo Push Token:", expoPushToken);
  return{
    expoPushToken,
    notification
  }
};
