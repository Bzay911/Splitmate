import React, { useEffect } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconRegular from 'react-native-vector-icons/FontAwesome5';

// Map route names to Ionicons names (outline and filled versions)
const iconMapping = {
  index: {
    outline: 'th-large',
    filled: 'th-large'
  },
  Groups: {
    outline: 'users',
    filled: 'users'
  },
  History: {
    outline: 'bar-chart-o',
    filled: 'bar-chart-o'
  },
  Profile: {
    outline: 'user-circle',
    filled: 'user-circle'
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
    // Check if route exists in mapping
    if (!iconMapping[routeName]) {
      console.warn(`No icon mapping for route: ${routeName}`);
      return <Icon name="question-circle" size={28} color={color} />;
    }
    
    const iconType = isFocused ? 'filled' : 'outline';
    const iconName = iconMapping[routeName][iconType];
    
    if (iconType === 'outline') {
      return <Icon name={iconName} size={25} color={color}  />;
    }
    return <Icon name={iconName} size={25} color={color} />;
  }

  return (
    <Pressable {...pressableProps} style={styles.container}>
        <Animated.View style={animatedStyle}>   

      {renderIcon()}
      {label && <Text style={{color, fontSize: 10, marginTop: 4}}>{label}</Text>}
        </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default TabBarButton