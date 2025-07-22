import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, HoleScore, HoleSelection } from '../types';
import { BackArrow, Button, Input, Card, Select, LoadingSpinner } from '../components/ui';
import { storageService } from '../utils/storage';
import { calculateRoundTotal } from '../utils/stats';
import { randomUUID } from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'RoundEntry'>;

export const RoundEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, roundId, holeSelection: initialHoleSelection } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [datePlayed, setDatePlayed] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [saving, setSaving] = useState(false);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>(initialHoleSelection || '18holes');

  useEffect(() => {
    loadData();
  }, [courseId, roundId]);

  const getFilteredHoles = (holes: any[], selection: HoleSelection) => {
    switch (selection) {
      case 'front9':
        return holes.filter(hole => hole.number >= 1 && hole.number <= 9);
      case 'back9':
        return holes.filter(hole => hole.number >= 10 && hole.number <= 18);
      case '18holes':
      default:
        return holes;
    }
  };

  const loadData = async () => {
    try {
      const courses = await storageService.getCourses();
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);

      if (foundCourse) {
        if (roundId) {
          const rounds = await storageService.getRounds();
          const foundRound = rounds.find(r => r.id === roundId);
          if (foundRound) {
            setRound(foundRound);
            setDatePlayed(foundRound.datePlayed);
            setHoleScores(foundRound.holes);
          }
        } else {
          const filteredHoles = getFilteredHoles(foundCourse.holes, holeSelection);
          setHoleScores(
            filteredHoles.map(hole => ({
              holeNumber: hole.number,
              strokes: hole.par,
              greenInRegulation: null,
              upAndDown: null,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateHoleScore = (holeIndex: number, field: keyof HoleScore, value: any) => {
    const newScores = [...holeScores];
    newScores[holeIndex] = { ...newScores[holeIndex], [field]: value };
    setHoleScores(newScores);
  };

  const incrementScore = (holeIndex: number) => {
    const currentScore = holeScores[holeIndex]?.strokes || 0;
    updateHoleScore(holeIndex, 'strokes', currentScore + 1);
  };

  const decrementScore = (holeIndex: number) => {
    const currentScore = holeScores[holeIndex]?.strokes || 0;
    if (currentScore > 1) {
      updateHoleScore(holeIndex, 'strokes', currentScore - 1);
    }
  };

  const incrementPutts = (holeIndex: number) => {
    const currentPutts = holeScores[holeIndex]?.putts || 0;
    updateHoleScore(holeIndex, 'putts', currentPutts + 1);
  };

  const decrementPutts = (holeIndex: number) => {
    const currentPutts = holeScores[holeIndex]?.putts || 0;
    if (currentPutts > 0) {
      updateHoleScore(holeIndex, 'putts', currentPutts - 1);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || datePlayed;
    setShowDatePicker(Platform.OS === 'ios');
    setDatePlayed(currentDate);
  };

  const saveRound = async () => {
    if (!course) return;

    const totalStrokes = holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0);
    if (totalStrokes === 0) {
      Alert.alert('Error', 'Please enter at least one score');
      return;
    }

    setSaving(true);
    try {
      const roundData: Round = {
        id: roundId || randomUUID(),
        courseId,
        datePlayed: datePlayed,
        holes: holeScores,
        totalScore: totalStrokes,
        createdAt: round?.createdAt || new Date(),
      };

      await storageService.saveRound(roundData);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save round');
      console.error('Error saving round:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return <LoadingSpinner message="Loading course..." />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-4">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">
            {roundId ? 'Edit Round' : 'Add Round'}
          </Text>
        </View>
        <Text className="text-muted-foreground mb-6">{course.name}</Text>

        <View className="mb-4">
          <Text className="text-foreground font-medium mb-2">Date Played</Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={datePlayed}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
          />
        </View>

        <View className="mb-4">
          <Select
            label="Holes to Play"
            value={holeSelection}
            onValueChange={(value) => {
              const newSelection = value as HoleSelection;
              setHoleSelection(newSelection);
              if (course) {
                const filteredHoles = getFilteredHoles(course.holes, newSelection);
                setHoleScores(
                  filteredHoles.map(hole => ({
                    holeNumber: hole.number,
                    strokes: hole.par,
                    greenInRegulation: null,
                    upAndDown: null,
                  }))
                );
              }
            }}
            options={[
              { label: '18 Holes', value: '18holes' },
              { label: 'Front 9', value: 'front9' },
              { label: 'Back 9', value: 'back9' },
            ]}
          />
        </View>

        <Text className="text-lg font-semibold text-foreground mb-4">Hole Scores</Text>

        {getFilteredHoles(course.holes, holeSelection).map((hole, index) => (
          <Card key={hole.number} className="mb-4">
            <Text className="text-md font-semibold text-card-foreground mb-3">
              Hole {hole.number} • Par {hole.par} • HCP {hole.handicapIndex}
            </Text>
            
            <View className="flex-row gap-4 mb-3">
              <View className="flex-1">
                <Text className="text-foreground font-medium mb-2">Score</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => decrementScore(index)}
                    className="bg-secondary rounded w-10 h-10 items-center justify-center mr-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">-</Text>
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Input
                      value={holeScores[index]?.strokes?.toString() || hole.par.toString()}
                      onChangeText={(text) => updateHoleScore(index, 'strokes', parseInt(text) || hole.par)}
                      keyboardType="numeric"
                      placeholder="Strokes"
                      className="text-center"
                    />
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => incrementScore(index)}
                    className="bg-secondary rounded w-10 h-10 items-center justify-center ml-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex-1">
                <Text className="text-foreground font-medium mb-2">Putts</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => decrementPutts(index)}
                    className="bg-secondary rounded w-10 h-10 items-center justify-center mr-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">-</Text>
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Input
                      value={holeScores[index]?.putts?.toString() || ''}
                      onChangeText={(text) => updateHoleScore(index, 'putts', parseInt(text) || undefined)}
                      keyboardType="numeric"
                      placeholder="Putts"
                      className="text-center"
                    />
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => incrementPutts(index)}
                    className="bg-secondary rounded w-10 h-10 items-center justify-center ml-2"
                  >
                    <Text className="text-secondary-foreground font-bold text-lg">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4 mb-3">
              <View className="flex-1">
                <Input
                  label="Penalty Shots"
                  value={holeScores[index]?.penaltyShots?.toString() || ''}
                  onChangeText={(text) => updateHoleScore(index, 'penaltyShots', parseInt(text) || undefined)}
                  keyboardType="numeric"
                  placeholder="Penalties"
                />
              </View>
            </View>

            <View className="mb-3">
              <Select
                label="Fairway Hit"
                value={holeScores[index]?.fairwayHit || ''}
                onValueChange={(value) => updateHoleScore(index, 'fairwayHit', value || undefined)}
                options={[
                  { label: 'Not tracked', value: '' },
                  { label: 'Hit', value: 'hit' },
                  { label: 'Missed Left', value: 'left' },
                  { label: 'Missed Right', value: 'right' },
                ]}
                placeholder="Select fairway result"
              />
            </View>

            <View className="mb-3">
              <Select
                label="Green in Regulation"
                value={holeScores[index]?.greenInRegulation === null ? '' : holeScores[index]?.greenInRegulation?.toString() || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    updateHoleScore(index, 'greenInRegulation', null);
                  } else {
                    updateHoleScore(index, 'greenInRegulation', value === 'true');
                  }
                }}
                options={[
                  { label: 'Not tracked', value: '' },
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
                placeholder="Select GIR result"
              />
            </View>

            <View>
              <Select
                label="Up and Down"
                value={holeScores[index]?.upAndDown === null ? '' : holeScores[index]?.upAndDown?.toString() || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    updateHoleScore(index, 'upAndDown', null);
                  } else {
                    updateHoleScore(index, 'upAndDown', value === 'true');
                  }
                }}
                options={[
                  { label: 'Not tracked', value: '' },
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
                placeholder="Select up and down result"
              />
            </View>
          </Card>
        ))}

        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground">
            Total Score: {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0)}
          </Text>
          <Text className="text-muted-foreground">
            vs Par: {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0) - getFilteredHoles(course.holes, holeSelection).reduce((sum, hole) => sum + hole.par, 0) > 0 ? '+' : ''}
            {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0) - getFilteredHoles(course.holes, holeSelection).reduce((sum, hole) => sum + hole.par, 0)}
          </Text>
        </Card>

        <View className="flex-row gap-4">
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            className="flex-1"
          />
          <Button
            title={saving ? "Saving..." : "Save Round"}
            onPress={saveRound}
            disabled={saving}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  );
};