import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, HoleSelection } from '../types';
import { BackArrow, Button, Input, Card, Select, LoadingSpinner } from '../components/ui';
import { storageService } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'HandicapEntry'>;

export const HandicapEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [entryMode, setEntryMode] = useState<'handicap' | 'target'>('handicap');
  const [handicap, setHandicap] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [holeSelection, setHoleSelection] = useState<HoleSelection>('18holes');

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const courses = await storageService.getCourses();
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);
      
      if (foundCourse) {
        const totalPar = foundCourse.holes.reduce((sum, hole) => sum + hole.par, 0);
        setTargetScore(totalPar.toString());
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const calculateParAdjustments = (handicapValue: number, totalPar: number) => {
    if (!course) return [];
    
    const adjustments = course.holes.map(hole => {
      let adjustedPar = hole.par;
      
      if (handicapValue > 0) {
        const strokesOnHole = Math.floor(handicapValue / 18) + 
          (hole.handicapIndex <= (handicapValue % 18) ? 1 : 0);
        adjustedPar += strokesOnHole;
      }
      
      return {
        hole: hole.number,
        originalPar: hole.par,
        adjustedPar,
        strokes: adjustedPar - hole.par
      };
    });
    
    return adjustments;
  };

  const startLiveScoring = () => {
    if (entryMode === 'handicap') {
      const handicapValue = parseFloat(handicap);
      if (isNaN(handicapValue) || handicapValue < 0 || handicapValue > 54) {
        Alert.alert('Invalid Handicap', 'Please enter a valid handicap between 0 and 54');
        return;
      }
      navigation.navigate('LiveScoring', { courseId, handicap: handicapValue, holeSelection });
    } else {
      const targetValue = parseInt(targetScore);
      if (isNaN(targetValue) || targetValue < 18 || targetValue > 200) {
        Alert.alert('Invalid Target', 'Please enter a valid target score');
        return;
      }
      // Calculate effective handicap from target score
      const totalPar = course?.holes.reduce((sum, hole) => sum + hole.par, 0) || 72;
      const effectiveHandicap = Math.max(0, targetValue - totalPar);
      navigation.navigate('LiveScoring', { courseId, handicap: effectiveHandicap, targetScore: targetValue, holeSelection });
    }
  };

  if (!course) {
    return <LoadingSpinner message="Loading course setup..." />;
  }

  const totalPar = course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const handicapValue = parseFloat(handicap);
  const adjustments = !isNaN(handicapValue) ? calculateParAdjustments(handicapValue, totalPar) : [];
  const adjustedTotalPar = adjustments.reduce((sum, adj) => sum + adj.adjustedPar, 0);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-4">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">Setup Round</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-6 px-2">
          <Text className="text-lg font-semibold text-card-foreground mb-2">{course.name}</Text>
          <Text className="text-muted-foreground mb-2">
            Course Par: {totalPar}
          </Text>
        </View>

        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-4">Holes to Play</Text>
          <Select
            value={holeSelection}
            onValueChange={(value) => setHoleSelection(value as HoleSelection)}
            options={[
              { label: '18 Holes (Full Round)', value: '18holes' },
              { label: 'Front 9 (Holes 1-9)', value: 'front9' },
              { label: 'Back 9 (Holes 10-18)', value: 'back9' },
            ]}
          />
          <Text className="text-sm text-muted-foreground mt-2">
            Choose which holes you want to play during this round.
          </Text>
        </Card>

        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-4">Scoring Mode</Text>
          
          <Select
            value={entryMode}
            onValueChange={(value) => setEntryMode(value as 'handicap' | 'target')}
            options={[
              { label: 'Use Handicap Index', value: 'handicap' },
              { label: 'Set Target Score', value: 'target' },
            ]}
          />

          {entryMode === 'handicap' ? (
            <>
              <Text className="text-lg font-semibold text-card-foreground mb-4">Handicap Index</Text>
              <Input
                value={handicap}
                onChangeText={setHandicap}
                keyboardType="decimal-pad"
                placeholder="Enter your handicap (e.g., 18.0)"
                className="mb-4"
              />
              <Text className="text-sm text-muted-foreground mb-4">
                Your handicap will be used to calculate adjusted pars for each hole based on their difficulty.
              </Text>
              
              {!isNaN(handicapValue) && handicapValue >= 0 && (
                <View>
                  <Text className="text-sm font-medium text-card-foreground mb-2">
                    Adjusted Course Par: {adjustedTotalPar} (was {totalPar})
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold text-card-foreground mb-4">Target Score</Text>
              <Input
                value={targetScore}
                onChangeText={setTargetScore}
                keyboardType="numeric"
                placeholder="Enter your target score"
                className="mb-4"
              />
              <Text className="text-sm text-muted-foreground mb-4">
                Set a target score for your round. This will be converted to an effective handicap and applied to each hole.
              </Text>
              
              {(() => {
                const targetValue = parseInt(targetScore);
                if (!isNaN(targetValue) && targetValue > totalPar) {
                  const effectiveHandicap = targetValue - totalPar;
                  const adjustments = calculateParAdjustments(effectiveHandicap, totalPar);
                  const adjustedTotalPar = adjustments.reduce((sum, adj) => sum + adj.adjustedPar, 0);
                  return (
                    <View>
                      <Text className="text-sm font-medium text-card-foreground mb-2">
                        Effective Handicap: {effectiveHandicap} • Adjusted Course Par: {adjustedTotalPar}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        Your target of {targetValue} is {effectiveHandicap} over par, so you'll receive strokes accordingly.
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
            </>
          )}
        </Card>


        
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <Button
          title="Start Live Scoring"
          onPress={startLiveScoring}
          disabled={
            (entryMode === 'handicap' && (handicap === '' || isNaN(parseFloat(handicap)))) ||
            (entryMode === 'target' && (targetScore === '' || isNaN(parseInt(targetScore))))
          }
        />
      </View>
    </View>
  );
};