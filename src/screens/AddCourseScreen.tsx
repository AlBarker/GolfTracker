import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Hole } from '../types';
import { BackArrow, Button, Input, Card } from '../components/ui';
import { storageService } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { randomUUID } from 'expo-crypto';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCourse'>;

export const AddCourseScreen: React.FC<Props> = ({ navigation }) => {
  const [courseName, setCourseName] = useState('');
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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

  const incrementPar = (index: number) => {
    const currentPar = holes[index]?.par || 3;
    if (currentPar < 6) { // Reasonable upper limit for par
      updateHole(index, 'par', currentPar + 1);
    }
  };

  const decrementPar = (index: number) => {
    const currentPar = holes[index]?.par || 3;
    if (currentPar > 3) { // Reasonable lower limit for par
      updateHole(index, 'par', currentPar - 1);
    }
  };

  const saveCourse = async () => {
    if (!courseName.trim()) {
      Alert.alert('Error', 'Please enter a course name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const newCourse: Course = {
        id: randomUUID(),
        userId: user.id,
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
      <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-6">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">Add New Course</Text>
        </View>
        
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
                <Text className="text-foreground font-medium mb-2">Par</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => decrementPar(index)}
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center mr-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">-</Text>
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Input
                      value={hole.par.toString()}
                      onChangeText={(text) => updateHole(index, 'par', parseInt(text) || 4)}
                      keyboardType="numeric"
                      placeholder="Par"
                      className="text-center"
                    />
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => incrementPar(index)}
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center ml-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">+</Text>
                  </TouchableOpacity>
                </View>
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