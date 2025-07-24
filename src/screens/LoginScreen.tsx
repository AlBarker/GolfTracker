import React, { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Button } from '../components/ui';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <View className="flex-1 justify-center px-6">
        <View className="bg-white rounded shadow-md p-6">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
            Welcome to ParPal
          </Text>
          
          <View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              className="mt-6"
            />

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Button
                title="Sign Up"
                onPress={handleSignUpPress}
                variant="outline"
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};