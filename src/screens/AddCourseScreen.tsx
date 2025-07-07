import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Hole } from '../types';
import { Button, Input, Card } from '../components/ui';
import { storageService } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCourse'>;

export const AddCourseScreen: React.FC<Props> = ({ navigation }) => {
  const [courseName, setCourseName] = useState('');
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      handicapIndex: i + 1,
    }))
  );
  const [saving, setSaving] = useState(false);

  const updateHole = (index: number, field: keyof Hole, value: number) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const saveCourse = async () => {
    if (!courseName.trim()) {
      Alert.alert('Error', 'Please enter a course name');
      return;
    }

    setSaving(true);
    try {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: courseName.trim(),
        holes: holes,
        createdAt: new Date(),
      };

      await storageService.saveCourse(newCourse);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save course');
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-foreground mb-6">Add New Course</Text>
        
        <Input
          label="Course Name"
          value={courseName}
          onChangeText={setCourseName}
          placeholder="Enter course name"
        />

        <Text className="text-lg font-semibold text-foreground mb-4">Hole Details</Text>
        
        {holes.map((hole, index) => (
          <Card key={hole.number} className="mb-4">
            <Text className="text-md font-semibold text-card-foreground mb-3">
              Hole {hole.number}
            </Text>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Input
                  label="Par"
                  value={hole.par.toString()}
                  onChangeText={(text) => updateHole(index, 'par', parseInt(text) || 3)}
                  keyboardType="numeric"
                  placeholder="Par"
                />
              </View>
              
              <View className="flex-1">
                <Input
                  label="Handicap Index"
                  value={hole.handicapIndex.toString()}
                  onChangeText={(text) => updateHole(index, 'handicapIndex', parseInt(text) || 1)}
                  keyboardType="numeric"
                  placeholder="Handicap"
                />
              </View>
            </View>
          </Card>
        ))}

        <View className="flex-row gap-4 mt-6">
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            className="flex-1"
          />
          <Button
            title={saving ? "Saving..." : "Save Course"}
            onPress={saveCourse}
            disabled={saving}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  );
};