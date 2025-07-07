import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onValueChange,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center justify-between py-2 ${className}`}>
      {label && (
        <Text className="text-foreground font-medium flex-1">{label}</Text>
      )}
      
      <TouchableOpacity
        className={`w-12 h-6 rounded-full justify-center ${
          value ? 'bg-primary' : 'bg-muted'
        }`}
        onPress={() => onValueChange(!value)}
      >
        <View
          className={`w-5 h-5 rounded-full bg-background shadow-sm ${
            value ? 'ml-6' : 'ml-0.5'
          }`}
        />
      </TouchableOpacity>
    </View>
  );
};