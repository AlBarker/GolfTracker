import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <View className="">
      {label && (
        <Text className="text-foreground font-medium mb-2">{label}</Text>
      )}
      <TextInput
        className={`border bg-background rounded-xl px-2 py-3 text-foreground ${
          error ? 'border-destructive' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && (
        <Text className="text-destructive text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};