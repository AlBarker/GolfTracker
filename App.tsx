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
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'My Golf Diary' }}
        />
        <Stack.Screen 
          name="AddCourse" 
          component={AddCourseScreen} 
          options={{ title: 'Add Course' }}
        />
        <Stack.Screen 
          name="CourseDetails" 
          component={CourseDetailsScreen} 
          options={{ title: 'Course Details' }}
        />
        <Stack.Screen 
          name="RoundEntry" 
          component={RoundEntryScreen} 
          options={{ title: 'Round Entry' }}
        />
        <Stack.Screen 
          name="LiveScoring" 
          component={LiveScoringScreen} 
          options={{ title: 'Live Scoring' }}
        />
        <Stack.Screen 
          name="RoundDetails" 
          component={RoundDetailsScreen} 
          options={{ title: 'Round Details' }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
