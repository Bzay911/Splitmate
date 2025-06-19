import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import TabBarButton from "./TabBarButton";

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const primaryColor = "#fccc28";
  const greyColor = "#737373";
  return (
    // <View style={styles.tabbar}>
    <LinearGradient
    colors={['#2a2a2a', '#1a1a1a', '#0f0f0f']}
    style={styles.tabbar}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;


        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

       

        return (
          <TabBarButton
          key={route.name}
          onPress={onPress}
          isFocused={isFocused}
          routeName={route.name}
          color={isFocused? primaryColor: greyColor}
          label={label}
          />
        );
      })}
    </LinearGradient>
    // </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: "continuous",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default TabBar;
