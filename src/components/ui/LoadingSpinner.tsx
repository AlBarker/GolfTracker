import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = 'medium' 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <View className="items-center">
        {/* Animated spinning circle */}
        <Animated.View
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderWidth: 3,
            borderColor: '#6b7280', // muted-foreground equivalent
            borderTopColor: '#2E7D32r', // primary equivalent  
            borderRadius: spinnerSize / 2,
            marginBottom: 16,
            transform: [{ rotate: spin }],
          }}
        />
        <Text className="text-muted-foreground text-center">{message}</Text>
      </View>
    </View>
  );
};