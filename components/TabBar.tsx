import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TabBar = ({state, descriptors, navigation}) => {
  
    const primaryColor = '#0891b2';
    const greyColor = '#737373';

    return (
      <View style={styles.tabBar}>
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
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
  
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
  
          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              style={styles.tabBarItem}
            >
              {options.tabBarIcon ? 
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? primaryColor : greyColor,
                  size: 24,
                }) : null}
              
              {label ? (
                <Text style={{ color: isFocused ? primaryColor : greyColor }}>
                  {label}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
}

const styles = StyleSheet.create({
    tabBar:{
        position: 'absolute',
        bottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        borderCurve: 'continuous',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 10},
        shadowRadius: 10,
        shadowOpacity: 0.1,
    },
    tabBarItem:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default TabBar