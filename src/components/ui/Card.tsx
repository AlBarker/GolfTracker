import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View
      className={`bg-card shadow-md p-4 border-primary border rounded-xl ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};