import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface BackArrowProps {
  onPress?: () => void;
}

export const BackArrow: React.FC<BackArrowProps> = ({ onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center justify-center w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200"
    >
      <Text className="text-xl text-gray-700">←</Text>
    </TouchableOpacity>
  );
};