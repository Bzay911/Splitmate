// import React, { useEffect } from 'react';
// import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
// import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
// import IconFA from 'react-native-vector-icons/FontAwesome';
// import Feather from 'react-native-vector-icons/Feather';

// // Map route names to FontAwesome names
// const iconMapping = {
//   index: { outline: 'th-large', filled: 'th-large' },
//   Groups: { outline: 'users', filled: 'users' },
//   History: { outline: 'bar-chart-o', filled: 'bar-chart-o' },
//   Profile: { outline: 'user-circle', filled: 'user-circle' },
// };

// type RouteNames = keyof typeof iconMapping;

// interface TabBarButtonProps extends PressableProps {
//   isFocused: boolean;
//   routeName: RouteNames;
//   color: string;
//   label?: string;
// }

// const TabBarButton = (props: TabBarButtonProps) => {
//   const { isFocused, routeName, color, label, ...pressableProps } = props;

//   const scale = useSharedValue(0);

//   useEffect(() => {
//     scale.value = withSpring(
//       typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
//       { duration: 350 }
//     );
//   }, [isFocused, scale]);

//   const animatedStyle = useAnimatedStyle(() => {
//     const scaleValue = interpolate(scale.value, [0, 1], [0.9, 1.1]);
//     return {
//       transform: [{ scale: scaleValue }],
//     };
//   });

//   const renderIcon = () => {
//     // Special case: use Feather for History tab
//     if (routeName === 'History') {
//       return <Feather name="trending-up" size={25} color={color} />;
//     }

//     // Default: FontAwesome
//     if (!iconMapping[routeName]) {
//       console.warn(`No icon mapping for route: ${routeName}`);
//       return <IconFA name="question-circle" size={28} color={color} />;
//     }

//     const iconType = isFocused ? 'filled' : 'outline';
//     const iconName = iconMapping[routeName][iconType];
//     return <IconFA name={iconName} size={25} color={color} />;
//   };

//   return (
//     <Pressable {...pressableProps} style={styles.container}>
//       <Animated.View style={animatedStyle}>
//         {renderIcon()}
//         {label && <Text style={{ color, fontSize: 10, marginTop: 4 }}>{label}</Text>}
//       </Animated.View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default TabBarButton;
