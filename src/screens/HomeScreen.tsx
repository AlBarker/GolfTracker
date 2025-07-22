import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round } from '../types';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { storageService } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface CourseWithStats extends Course {
  roundsPlayed: number;
  bestScore: number | null;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [recentRounds, setRecentRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const savedCourses = await storageService.getCourses();
      const allRounds = await storageService.getRounds();
      
      // Calculate course statistics
      const coursesWithStats: CourseWithStats[] = savedCourses.map(course => {
        const courseRounds = allRounds.filter(round => round.courseId === course.id);
        const roundsPlayed = courseRounds.length;
        const bestScore = roundsPlayed > 0 
          ? Math.min(...courseRounds.map(round => round.totalScore))
          : null;
        
        return {
          ...course,
          roundsPlayed,
          bestScore
        };
      });
      
      // Get recent rounds (last 5)
      const sortedRounds = allRounds
        .sort((a, b) => new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime())
        .slice(0, 5);
      
      setCourses(coursesWithStats);
      setRecentRounds(sortedRounds);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseItem = ({ item }: { item: CourseWithStats }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
      className="mb-3"
    >
      <Card>
        <Text className="text-lg font-semibold text-card-foreground">{item.name}</Text>
        <Text className="text-muted-foreground mt-1">
          {item.holes.length} holes • Par {item.holes.reduce((sum, hole) => sum + hole.par, 0)}
        </Text>
        {item.roundsPlayed > 0 && item.bestScore && (
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-muted-foreground">
              {item.roundsPlayed} round{item.roundsPlayed !== 1 ? 's' : ''} played
            </Text>
            <Text className="text-sm font-medium text-primary">
              Best: {item.bestScore}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderRecentRoundItem = ({ item }: { item: Round }) => {
    const course = courses.find(c => c.id === item.courseId);
    const coursePar = course?.holes.reduce((sum, hole) => sum + hole.par, 0) || 0;
    const scoreToPar = item.totalScore - coursePar;
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('RoundDetails', { roundId: item.id })}
        className="mb-3"
      >
        <Card>
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-card-foreground">{course?.name}</Text>
              <Text className="text-muted-foreground text-sm">
                {new Date(item.datePlayed).toLocaleDateString()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xl font-bold text-primary">{item.totalScore}</Text>
              <Text className={`text-sm font-medium ${
                scoreToPar === 0 ? 'text-foreground' :
                scoreToPar > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {scoreToPar > 0 ? '+' : ''}{scoreToPar}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading courses..." />;
  }

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
    <Pressable onPress={() => setShowDropdown(false)} className="flex-1">
      <ScrollView className="flex-1 bg-background">
        <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-foreground">ParPal</Text>
          <View className="relative">
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            >
              <Ionicons name="settings-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            {showDropdown && (
              <View className="absolute top-12 right-0 bg-card rounded shadow-lg border border-border p-1 min-w-[150px] z-50">
                <View className="px-3 py-2 border-b border-border">
                  <Text className="text-xs text-muted-foreground">Signed in as</Text>
                  <Text className="text-sm font-medium text-foreground">{user?.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="px-3 py-2 flex-row items-center gap-2"
                >
                  <Ionicons name="log-out-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-foreground">Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Courses Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">My Courses</Text>
            <Button
              title="Add Course"
              onPress={() => navigation.navigate('AddCourse')}
              variant="outline"
              className="px-4 py-2"
            />
          </View>

          {courses.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-muted-foreground text-center">
                No courses yet. Add your first course to get started!
              </Text>
            </View>
          ) : (
            <FlatList
              data={courses}
              renderItem={renderCourseItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
        
        {/* Recent Rounds Section */}
        {recentRounds.length > 0 && (
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">Recent Rounds</Text>
            <FlatList
              data={recentRounds}
              renderItem={renderRecentRoundItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}
        </View>
      </ScrollView>
    </Pressable>
  );
};