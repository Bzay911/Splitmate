import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import Animated,{ useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';
import {Pressable, PressableProps, StyleSheet, Text } from 'react-native';

// Map route names to Ionicons names (outline and filled versions)
const iconMapping = {
  Home: {
    outline: 'home-outline',
    filled: 'home'
  },
  Groups: {
    outline: 'people-outline',
    filled: 'people'
  },
  History: {
    outline: 'reload-outline',
    filled: 'reload'
  },
  Profile: {
    outline: 'person-outline',
    filled: 'person'
  }
};

type RouteNames = keyof typeof iconMapping;

interface TabBarButtonProps extends PressableProps {
  isFocused: boolean;
  routeName: RouteNames;
  color: string;
  label?: string;
}

const TabBarButton = (props: TabBarButtonProps) => {
  const {isFocused, routeName, color, label, ...pressableProps} = props;
  
    const scale = useSharedValue(0);

    useEffect(()=> {
        scale.value = withSpring( typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused, 
    {duration: 350});
    }, [isFocused, scale])
  
    const animatedStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(
            scale.value,
            [0, 1],
            [0.8, 1.2],
        )
        return {
            transform: [{scale: scaleValue}]
        }
    })
  const renderIcon = () => {
    const iconType = isFocused ? 'filled' : 'outline';
    const iconName = iconMapping[routeName][iconType];
    return <Ionicons name={iconName as any} size={26} color={color} />;
  }

  return (
    <Pressable {...pressableProps} style={styles.container}>
        <Animated.View style={animatedStyle}>   

      {renderIcon()}
      {label && <Text style={{color, fontSize: 12}}>{label}</Text>}
        </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    }
})

export default TabBarButton