import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course } from '../types';
import { Button, Card } from '../components/ui';
import { storageService } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const savedCourses = await storageService.getCourses();
      setCourses(savedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
      className="mb-3"
    >
      <Card>
        <Text className="text-lg font-semibold text-card-foreground">{item.name}</Text>
        <Text className="text-muted-foreground mt-1">
          {item.holes.length} holes • Par {item.holes.reduce((sum, hole) => sum + hole.par, 0)}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-muted-foreground">Loading courses...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-foreground mb-6">My Golf Diary</Text>
        
        <Button
          title="Add New Course"
          onPress={() => navigation.navigate('AddCourse')}
          className="mb-6"
        />

        {courses.length === 0 ? (
          <View className="flex-1 justify-center items-center">
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
          />
        )}
      </View>
    </View>
  );
};