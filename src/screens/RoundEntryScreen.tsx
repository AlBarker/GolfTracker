import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, HoleScore } from '../types';
import { BackArrow, Button, Input, Card, Select, Switch } from '../components/ui';
import { storageService } from '../utils/storage';
import { calculateRoundTotal } from '../utils/stats';
import { randomUUID } from 'expo-crypto';

type Props = NativeStackScreenProps<RootStackParamList, 'RoundEntry'>;

export const RoundEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, roundId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().split('T')[0]);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [courseId, roundId]);

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
            setDatePlayed(foundRound.datePlayed.toISOString().split('T')[0]);
            setHoleScores(foundRound.holes);
          }
        } else {
          setHoleScores(
            foundCourse.holes.map(hole => ({
              holeNumber: hole.number,
              strokes: hole.par,
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
        datePlayed: new Date(datePlayed),
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
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-muted-foreground">Loading course...</Text>
      </View>
    );
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

        <Input
          label="Date Played"
          value={datePlayed}
          onChangeText={setDatePlayed}
          placeholder="YYYY-MM-DD"
        />

        <Text className="text-lg font-semibold text-foreground mb-4">Hole Scores</Text>

        {course.holes.map((hole, index) => (
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
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center mr-2"
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
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center ml-2"
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
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center mr-2"
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
                    className="bg-secondary rounded-lg w-10 h-10 items-center justify-center ml-2"
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
              <Switch
                label="Green in Regulation"
                value={holeScores[index]?.greenInRegulation || false}
                onValueChange={(value) => updateHoleScore(index, 'greenInRegulation', value)}
              />
            </View>

            <View>
              <Switch
                label="Up and Down"
                value={holeScores[index]?.upAndDown || false}
                onValueChange={(value) => updateHoleScore(index, 'upAndDown', value)}
              />
            </View>
          </Card>
        ))}

        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground">
            Total Score: {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0)}
          </Text>
          <Text className="text-muted-foreground">
            vs Par: {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0) - course.holes.reduce((sum, hole) => sum + hole.par, 0) > 0 ? '+' : ''}
            {holeScores.reduce((sum, hole) => sum + (hole.strokes || 0), 0) - course.holes.reduce((sum, hole) => sum + hole.par, 0)}
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