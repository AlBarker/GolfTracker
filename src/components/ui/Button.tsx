import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded items-center justify-center';
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };
  const variantClasses = {
    primary: 'bg-primary active:bg-primary/90',
    secondary: 'bg-secondary active:bg-secondary/90',
    outline: 'border-2 border-primary active:bg-primary/10',
    destructive: 'bg-red-600 active:bg-red-700',
  };

  const textClasses = {
    primary: 'text-primary-foreground font-semibold',
    secondary: 'text-secondary-foreground font-semibold',
    outline: 'text-primary font-semibold',
    destructive: 'text-white font-semibold',
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <Text className={textClasses[variant]}>{title}</Text>
    </TouchableOpacity>
  );
};