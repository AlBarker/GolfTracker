import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/types';
import {
  HomeScreen,
  AddCourseScreen,
  CourseDetailsScreen,
  RoundEntryScreen,
  LiveScoringScreen,
  RoundDetailsScreen,
} from './src/screens';
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddCourse" component={AddCourseScreen} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="RoundEntry" component={RoundEntryScreen} />
        <Stack.Screen name="LiveScoring" component={LiveScoringScreen} />
        <Stack.Screen name="RoundDetails" component={RoundDetailsScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
