import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-foreground font-medium mb-2">{label}</Text>
      )}
      
      <TouchableOpacity
        className="border border-border rounded-lg px-3 py-3 bg-background"
        onPress={() => setIsOpen(true)}
      >
        <Text className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-popover rounded-lg mx-4 w-80 max-h-64 shadow-lg">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => handleSelect(item.value)}
                >
                  <Text className="text-popover-foreground">{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};