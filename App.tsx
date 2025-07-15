import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RootStackParamList } from './src/types';
import {
  HomeScreen,
  AddCourseScreen,
  CourseDetailsScreen,
  RoundEntryScreen,
  LiveScoringScreen,
  RoundDetailsScreen,
  LoginScreen,
  SignUpScreen,
} from './src/screens';
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddCourse" component={AddCourseScreen} />
            <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
            <Stack.Screen name="RoundEntry" component={RoundEntryScreen} />
            <Stack.Screen name="LiveScoring" component={LiveScoringScreen} />
            <Stack.Screen name="RoundDetails" component={RoundDetailsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
