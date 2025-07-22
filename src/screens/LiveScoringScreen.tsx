import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, HoleScore, HoleSelection } from '../types';
import { BackArrow, Button, Input, Card, Select, LoadingSpinner } from '../components/ui';
import { storageService } from '../utils/storage';
import { randomUUID } from 'expo-crypto';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveScoring'>;

export const LiveScoringScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, handicap, targetScore, holeSelection: initialHoleSelection } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentHole, setCurrentHole] = useState(0);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [currentScore, setCurrentScore] = useState<HoleScore>({
    holeNumber: 1,
    strokes: 0,
    greenInRegulation: null,
    upAndDown: null,
  });
  const [saving, setSaving] = useState(false);
  const [adjustedPars, setAdjustedPars] = useState<number[]>([]);
  const [holeSelection, setHoleSelection] = useState<HoleSelection>(initialHoleSelection || '18holes');
  const [filteredHoles, setFilteredHoles] = useState<any[]>([]);
  const [editingNotes, setEditingNotes] = useState('');
  const [notesChanged, setNotesChanged] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    // Update notes when hole changes
    if (filteredHoles[currentHole]) {
      setEditingNotes(filteredHoles[currentHole].notes || '');
      setNotesChanged(false);
    }
  }, [currentHole, filteredHoles]);

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

  const calculateAdjustedPars = (holes: any[], handicapValue?: number) => {
    if (!handicapValue) {
      return holes.map(hole => hole.par);
    }

    return holes.map(hole => {
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
    return adjustedPars[holeIndex] || filteredHoles[holeIndex]?.par || 0;
  };

  const loadCourse = async () => {
    try {
      const courses = await storageService.getCourses();
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);

      if (foundCourse) {
        const filtered = getFilteredHoles(foundCourse.holes, holeSelection);
        setFilteredHoles(filtered);
        
        const pars = calculateAdjustedPars(filtered, handicap);
        setAdjustedPars(pars);
        
        setHoleScores(
          filtered.map((hole, index) => ({
            holeNumber: hole.number,
            strokes: pars[index],
          }))
        );
        
        if (filtered.length > 0) {
          setCurrentScore({
            holeNumber: filtered[0].number,
            strokes: pars[0],
            greenInRegulation: null,
            upAndDown: null,
          });
        }
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

  const handleNotesChange = (text: string) => {
    setEditingNotes(text);
    setNotesChanged(text !== (filteredHoles[currentHole]?.notes || ''));
  };

  const saveCurrentHoleNotes = async () => {
    if (!course || !filteredHoles[currentHole] || !notesChanged) return;
    
    try {
      await storageService.updateHoleNotes(course.id, filteredHoles[currentHole].number, editingNotes);
      
      // Update local filtered holes
      setFilteredHoles(prev => {
        const newHoles = [...prev];
        newHoles[currentHole] = { ...newHoles[currentHole], notes: editingNotes || undefined };
        return newHoles;
      });
      
      setNotesChanged(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const nextHole = async () => {
    if (!course || !currentScore.strokes || currentScore.strokes < 1) {
      Alert.alert('Error', 'Please enter a valid score for this hole');
      return;
    }

    // Save notes if changed
    await saveCurrentHoleNotes();

    const newHoleScores = [...holeScores];
    newHoleScores[currentHole] = currentScore;
    setHoleScores(newHoleScores);

    if (currentHole < filteredHoles.length - 1) {
      const nextHoleIndex = currentHole + 1;
      setCurrentHole(nextHoleIndex);
      setCurrentScore({
        holeNumber: filteredHoles[nextHoleIndex].number,
        strokes: getDisplayPar(nextHoleIndex),
        greenInRegulation: null,
        upAndDown: null,
      });
    } else {
      finishRound(newHoleScores);
    }
  };

  const previousHole = async () => {
    if (currentHole > 0) {
      // Save notes if changed
      await saveCurrentHoleNotes();
      
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
    return <LoadingSpinner message="Loading course..." />;
  }

  const hole = filteredHoles[currentHole];
  
  if (!hole) {
    return <LoadingSpinner message="Preparing holes..." />;
  }
  
  const displayPar = getDisplayPar(currentHole);
  const originalPar = hole.par;
  const totalScore = holeScores.slice(0, currentHole).reduce((sum, hole) => sum + hole.strokes, 0) + (currentScore.strokes || 0);
  
  const getTotalParContext = () => {
    const totalPar = adjustedPars.slice(0, currentHole + 1).reduce((sum, par) => sum + par, 0);
    const totalAdjustedPar = adjustedPars.reduce((sum, par) => sum + par, 0);
    
    if (targetScore) {
      return { expected: totalPar, label: `Target: ${targetScore} (Adjusted Par: ${totalAdjustedPar})` };
    } else {
      return { expected: totalPar, label: `Adjusted Par: ${totalAdjustedPar}` };
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
                +{displayPar - originalPar} stroke(s) from {targetScore ? `target score (${targetScore})` : 'handicap'}
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


        {/* Hole Notes */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-3">Hole Notes</Text>
          <Input
            value={editingNotes}
            onChangeText={handleNotesChange}
            placeholder={`Add notes for hole ${hole.number}...`}
            multiline
            numberOfLines={3}
            className="min-h-[75px]"
          />
          {notesChanged && (
            <View className="flex-row justify-end mt-2">
              <Button
                title="Save Notes"
                onPress={saveCurrentHoleNotes}
                variant="outline"
                className="py-1 px-3"
              />
            </View>
          )}
          <Text className="text-xs text-muted-foreground mt-2">
            Notes are automatically saved when you move to the next hole
          </Text>
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
            <Select
              label="Green in Regulation"
              value={currentScore.greenInRegulation === null ? '' : currentScore.greenInRegulation?.toString() || ''}
              onValueChange={(value) => {
                if (value === '') {
                  updateCurrentScore('greenInRegulation', null);
                } else {
                  updateCurrentScore('greenInRegulation', value === 'true');
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
              value={currentScore.upAndDown === null ? '' : currentScore.upAndDown?.toString() || ''}
              onValueChange={(value) => {
                if (value === '') {
                  updateCurrentScore('upAndDown', null);
                } else {
                  updateCurrentScore('upAndDown', value === 'true');
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
            title={currentHole === filteredHoles.length - 1 ? (saving ? "Finishing..." : "Finish Round") : "Next Hole"}
            onPress={nextHole}
            disabled={saving}
            className="flex-1"
          />
        </View>
        
        <View className="mt-2">
          <Text className="text-muted-foreground text-center text-sm">
            Hole {currentHole + 1} of {filteredHoles.length}
          </Text>
        </View>
      </View>
    </View>
  );
};