import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 w-10 h-10 rounded-full bg-muted items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Account</Text>
          <Card>
            <View className="py-2">
              <Text className="text-sm text-muted-foreground">Signed in as</Text>
              <Text className="text-base font-medium text-foreground mt-1">{user?.email}</Text>
            </View>
          </Card>
        </View>

        {/* Actions Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Actions</Text>
          <Card>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={20} color="#6b7280" />
                <Text className="text-base text-foreground ml-3">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </Card>
        </View>
      </View>
    </View>
  );
};