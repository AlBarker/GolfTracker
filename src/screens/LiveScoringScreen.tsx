import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, HoleScore } from '../types';
import { BackArrow, Button, Input, Card, Select, Switch } from '../components/ui';
import { storageService } from '../utils/storage';
import { randomUUID } from 'expo-crypto';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveScoring'>;

export const LiveScoringScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, handicap, targetScore } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentHole, setCurrentHole] = useState(0);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [currentScore, setCurrentScore] = useState<HoleScore>({
    holeNumber: 1,
    strokes: 0,
  });
  const [saving, setSaving] = useState(false);
  const [adjustedPars, setAdjustedPars] = useState<number[]>([]);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const calculateAdjustedPars = (course: Course, handicapValue?: number) => {
    if (!handicapValue) {
      return course.holes.map(hole => hole.par);
    }

    return course.holes.map(hole => {
      let adjustedPar = hole.par;
      
      if (handicapValue > 0) {
        const strokesOnHole = Math.floor(handicapValue / 18) + 
          (hole.handicapIndex <= (handicapValue % 18) ? 1 : 0);
        adjustedPar += strokesOnHole;
      }
      
      return adjustedPar;
    });
  };

  const getDisplayPar = (holeIndex: number) => {
    if (targetScore) {
      return course?.holes[holeIndex]?.par || 0;
    }
    return adjustedPars[holeIndex] || course?.holes[holeIndex]?.par || 0;
  };

  const loadCourse = async () => {
    try {
      const courses = await storageService.getCourses();
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);

      if (foundCourse) {
        const pars = calculateAdjustedPars(foundCourse, handicap);
        setAdjustedPars(pars);
        
        setHoleScores(
          foundCourse.holes.map((hole, index) => ({
            holeNumber: hole.number,
            strokes: pars[index],
          }))
        );
        setCurrentScore({
          holeNumber: 1,
          strokes: pars[0],
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const updateCurrentScore = (field: keyof HoleScore, value: any) => {
    setCurrentScore(prev => ({ ...prev, [field]: value }));
  };

  const incrementCurrentScore = () => {
    const currentStrokes = currentScore.strokes || 0;
    setCurrentScore(prev => ({ ...prev, strokes: currentStrokes + 1 }));
  };

  const decrementCurrentScore = () => {
    const currentStrokes = currentScore.strokes || 0;
    if (currentStrokes > 1) {
      setCurrentScore(prev => ({ ...prev, strokes: currentStrokes - 1 }));
    }
  };

  const incrementCurrentPutts = () => {
    const currentPutts = currentScore.putts || 0;
    setCurrentScore(prev => ({ ...prev, putts: currentPutts + 1 }));
  };

  const decrementCurrentPutts = () => {
    const currentPutts = currentScore.putts || 0;
    if (currentPutts > 0) {
      setCurrentScore(prev => ({ ...prev, putts: currentPutts - 1 }));
    }
  };

  const nextHole = () => {
    if (!course || !currentScore.strokes || currentScore.strokes < 1) {
      Alert.alert('Error', 'Please enter a valid score for this hole');
      return;
    }

    const newHoleScores = [...holeScores];
    newHoleScores[currentHole] = currentScore;
    setHoleScores(newHoleScores);

    if (currentHole < course.holes.length - 1) {
      const nextHoleIndex = currentHole + 1;
      setCurrentHole(nextHoleIndex);
      setCurrentScore({
        holeNumber: nextHoleIndex + 1,
        strokes: getDisplayPar(nextHoleIndex),
      });
    } else {
      finishRound(newHoleScores);
    }
  };

  const previousHole = () => {
    if (currentHole > 0) {
      const prevHoleIndex = currentHole - 1;
      setCurrentHole(prevHoleIndex);
      setCurrentScore(holeScores[prevHoleIndex]);
    }
  };

  const finishRound = async (finalScores: HoleScore[]) => {
    if (!course) return;

    setSaving(true);
    try {
      const totalScore = finalScores.reduce((sum, hole) => sum + hole.strokes, 0);
      
      const roundData: Round = {
        id: randomUUID(),
        courseId,
        datePlayed: new Date(),
        holes: finalScores,
        totalScore,
        createdAt: new Date(),
      };

      await storageService.saveRound(roundData);
      Alert.alert('Success', 'Round saved successfully!', [
        { 
          text: 'View Round', 
          onPress: () => navigation.replace('RoundDetails', { roundId: roundData.id })
        },
        { 
          text: 'Back to Course', 
          onPress: () => navigation.goBack() 
        }
      ]);
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

  const hole = course.holes[currentHole];
  const displayPar = getDisplayPar(currentHole);
  const originalPar = hole.par;
  const totalScore = holeScores.slice(0, currentHole).reduce((sum, hole) => sum + hole.strokes, 0) + (currentScore.strokes || 0);
  
  const getTotalParContext = () => {
    if (targetScore) {
      const completedHoles = currentHole;
      const averagePar = targetScore / course.holes.length;
      const expectedScore = Math.round(averagePar * (completedHoles + 1));
      return { expected: expectedScore, label: `Target: ${targetScore}` };
    } else {
      const totalPar = adjustedPars.slice(0, currentHole + 1).reduce((sum, par) => sum + par, 0);
      return { expected: totalPar, label: `Adjusted Par: ${adjustedPars.reduce((sum, par) => sum + par, 0)}` };
    }
  };
  
  const { expected: expectedScore, label: totalLabel } = getTotalParContext();

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-4">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">Live Scoring</Text>
        </View>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-4 pb-6">
        {/* Main Score Input - Prominent */}
        <Card className="mb-6 bg-primary/5 border border-primary/20">
          <View className="items-center mb-4">
            <Text className="text-xl font-bold text-card-foreground text-center">
              Score for Hole {hole.number}
            </Text>
            <Text className="text-muted-foreground text-center">
              {handicap ? (
                displayPar !== originalPar ? (
                  <>Par {displayPar} (was {originalPar}) • Handicap {hole.handicapIndex}</>
                ) : (
                  <>Par {displayPar} • Handicap {hole.handicapIndex}</>
                )
              ) : (
                <>Par {originalPar} • Handicap {hole.handicapIndex}</>
              )}
            </Text>
            {handicap && displayPar !== originalPar && (
              <Text className="text-xs text-primary text-center mt-1">
                +{displayPar - originalPar} stroke(s) from handicap
              </Text>
            )}
          </View>
          
          <View className="items-center mb-4">
            <View className="flex-row justify-center">
              <TouchableOpacity
                onPress={decrementCurrentScore}
                className="bg-primary rounded-full w-16 h-16 items-center justify-center mr-4"
              >
                <Text className="text-primary-foreground font-bold text-2xl">-</Text>
              </TouchableOpacity>
              
              <View className="mx-4">
                <Text className="text-6xl font-bold text-primary text-center mb-2">
                  {currentScore.strokes || displayPar}
                </Text>
                <Text className="text-muted-foreground text-center text-sm">
                  {(currentScore.strokes || displayPar) - displayPar > 0 ? '+' : ''}
                  {(currentScore.strokes || displayPar) - displayPar} vs {handicap ? 'Adjusted Par' : 'Par'}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={incrementCurrentScore}
                className="bg-primary rounded-full w-16 h-16 items-center justify-center ml-4"
              >
                <Text className="text-primary-foreground font-bold text-2xl">+</Text>
              </TouchableOpacity>
            </View>
            
            {/* Manual input option */}
            {/* <View className="w-24 mt-4">
              <Input
                value={currentScore.strokes?.toString() || ''}
                onChangeText={(text) => updateCurrentScore('strokes', parseInt(text) || displayPar)}
                keyboardType="numeric"
                placeholder={displayPar.toString()}
                className="text-center text-lg"
              />
            </View> */}
          </View>
        </Card>

        {/* Additional Stats - Separated and Less Prominent */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-4">Additional Stats</Text>
          
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-foreground font-medium mb-2">Putts</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={decrementCurrentPutts}
                  className="bg-secondary rounded w-10 h-10 items-center justify-center mr-2"
                >
                  <Text className="text-secondary-foreground font-bold text-lg">-</Text>
                </TouchableOpacity>
                
                <View className="flex-1">
                  <Input
                    value={currentScore.putts?.toString() || ''}
                    onChangeText={(text) => updateCurrentScore('putts', parseInt(text) || undefined)}
                    keyboardType="numeric"
                    placeholder="Putts"
                    className="text-center"
                  />
                </View>
                
                <TouchableOpacity
                  onPress={incrementCurrentPutts}
                  className="bg-secondary rounded w-10 h-10 items-center justify-center ml-2"
                >
                  <Text className="text-secondary-foreground font-bold text-lg">+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="flex-1">
              <Input
                label="Penalty Shots"
                value={currentScore.penaltyShots?.toString() || ''}
                onChangeText={(text) => updateCurrentScore('penaltyShots', parseInt(text) || undefined)}
                keyboardType="numeric"
                placeholder="Penalties"
              />
            </View>
          </View>

          <View className="mb-4">
            <Select
              label="Fairway Hit"
              value={currentScore.fairwayHit || ''}
              onValueChange={(value) => updateCurrentScore('fairwayHit', value || undefined)}
              options={[
                { label: 'Not tracked', value: '' },
                { label: 'Hit', value: 'hit' },
                { label: 'Missed Left', value: 'left' },
                { label: 'Missed Right', value: 'right' },
              ]}
              placeholder="Select fairway result"
            />
          </View>

          <View className="mb-4">
            <Switch
              label="Green in Regulation"
              value={currentScore.greenInRegulation || false}
              onValueChange={(value) => updateCurrentScore('greenInRegulation', value)}
            />
          </View>

          <View>
            <Switch
              label="Up and Down"
              value={currentScore.upAndDown || false}
              onValueChange={(value) => updateCurrentScore('upAndDown', value)}
            />
          </View>
        </Card>
        </View>
      </ScrollView>

      {/* Sticky Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <View className="flex-row gap-4">
          {currentHole > 0 && (
            <Button
              title="Previous"
              variant="outline"
              onPress={previousHole}
              className="flex-1"
            />
          )}
          
          <Button
            title={currentHole === course.holes.length - 1 ? (saving ? "Finishing..." : "Finish Round") : "Next Hole"}
            onPress={nextHole}
            disabled={saving}
            className="flex-1"
          />
        </View>
        
        <View className="mt-2">
          <Text className="text-muted-foreground text-center text-sm">
            Hole {currentHole + 1} of {course.holes.length}
          </Text>
        </View>
      </View>
    </View>
  );
};