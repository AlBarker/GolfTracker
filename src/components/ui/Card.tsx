import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View
      className={`bg-card rounded-lg shadow-md p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};