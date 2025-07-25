import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, RoundStats } from '../types';
import { BackArrow, Button, Card, LoadingSpinner, Input } from '../components/ui';
import { storageService } from '../utils/storage';
import { calculateRoundStats } from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetails'>;

export const CourseDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState<Course | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [stats, setStats] = useState<RoundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<{[holeNumber: number]: string}>({});
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useFocusEffect(
    React.useCallback(() => {
      loadCourseData();
    }, [courseId])
  );

  const loadCourseData = async () => {
    try {
      const courses = await storageService.getCourses();
      const foundCourse = courses.find(c => c.id === courseId);
      setCourse(foundCourse || null);

      if (foundCourse) {
        const courseRounds = await storageService.getRoundsByCourse(courseId);
        setRounds(courseRounds);
        setStats(calculateRoundStats(courseRounds, foundCourse));
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateHoleAverages = () => {
    if (!course || rounds.length === 0) return null;

    const holeAverages = course.holes.map(hole => {
      const holeScores = rounds
        .map(round => round.holes.find(h => h.holeNumber === hole.number))
        .filter(score => score && score.strokes > 0)
        .map(score => score!.strokes);

      if (holeScores.length === 0) return null;

      const average = holeScores.reduce((sum, score) => sum + score, 0) / holeScores.length;
      const best = Math.min(...holeScores);
      const worst = Math.max(...holeScores);

      return {
        hole: hole.number,
        par: hole.par,
        average: average,
        best: best,
        worst: worst,
        roundsPlayed: holeScores.length
      };
    }).filter(avg => avg !== null);

    return holeAverages;
  };

  const getAverageScoreColor = (average: number, par: number) => {
    const diff = average - par;
    if (diff <= -1) return 'text-green-600'; // Under par average
    if (diff <= 0.5) return 'text-foreground'; // Close to par
    if (diff <= 1.5) return 'text-yellow-600'; // Slightly over par
    if (diff <= 2.5) return 'text-orange-600'; // Well over par
    return 'text-red-600'; // Much over par
  };

  const handleNotesChange = (holeNumber: number, notes: string) => {
    setEditingNotes(prev => ({
      ...prev,
      [holeNumber]: notes
    }));
  };

  const saveHoleNotes = async (holeNumber: number) => {
    if (!course) return;
    
    const notes = editingNotes[holeNumber] || '';
    setSavingNotes(true);
    
    try {
      await storageService.updateHoleNotes(course.id, holeNumber, notes);
      
      // Update local course state
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          holes: prev.holes.map(hole => 
            hole.number === holeNumber 
              ? { ...hole, notes: notes || undefined }
              : hole
          )
        };
      });
      
      // Clear editing state for this hole
      setEditingNotes(prev => {
        const newState = { ...prev };
        delete newState[holeNumber];
        return newState;
      });
      
      Alert.alert('Success', `Notes saved for hole ${holeNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const renderRoundItem = ({ item }: { item: Round }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RoundDetails', { roundId: item.id })}
      className="mb-3"
    >
      <Card>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-card-foreground">{item.totalScore}</Text>
            <Text className="text-muted-foreground">{formatDate(item.datePlayed)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-muted-foreground">
              {item.totalScore - (course?.holes.reduce((sum, hole) => sum + hole.par, 0) || 0) > 0 ? '+' : ''}
              {item.totalScore - (course?.holes.reduce((sum, hole) => sum + hole.par, 0) || 0)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-muted-foreground">Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-4">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">{course.name}</Text>
        </View>
        <Text className="text-muted-foreground mb-6">
          {course.holes.length} holes • Par {course.holes.reduce((sum, hole) => sum + hole.par, 0)}
        </Text>

        <View className="flex-row gap-4 mb-6">
          <Button
            title="Add Round"
            onPress={() => navigation.navigate('RoundEntry', { courseId })}
            className="flex-1"
          />
          <Button
            title="Live Scoring"
            onPress={() => navigation.navigate('HandicapEntry', { courseId })}
            variant="secondary"
            className="flex-1"
          />
        </View>

        {stats && stats.totalRounds > 0 && (
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-card-foreground mb-3">Statistics</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Total Rounds:</Text>
                <Text className="font-semibold text-card-foreground">{stats.totalRounds}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Average Score:</Text>
                <Text className="font-semibold text-card-foreground">{stats.averageScore.toFixed(1)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Best Score:</Text>
                <Text className="font-semibold text-card-foreground">{stats.bestScore}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Worst Score:</Text>
                <Text className="font-semibold text-card-foreground">{stats.worstScore}</Text>
              </View>
              {stats.averagePutts > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Average Putts:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.averagePutts.toFixed(1)}</Text>
                </View>
              )}
              {(stats.fairwayHitPercentage > 0 || stats.fairwayMissedLeftPercentage > 0 || stats.fairwayMissedRightPercentage > 0) && (
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-muted-foreground">Fairway Hit %:</Text>
                    <Text className="font-semibold text-card-foreground">{stats.fairwayHitPercentage.toFixed(1)}%</Text>
                  </View>
                  {(stats.fairwayMissedLeftPercentage > 0 || stats.fairwayMissedRightPercentage > 0) && (
                    <View className="flex-row justify-between ml-4">
                      <Text className="text-xs text-muted-foreground">
                        Missed Left: {stats.fairwayMissedLeftPercentage.toFixed(1)}% • Missed Right: {stats.fairwayMissedRightPercentage.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {stats.greenInRegulationPercentage > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">GIR %:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.greenInRegulationPercentage.toFixed(1)}%</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Average Scorecard */}
        {rounds.length > 0 && calculateHoleAverages() && (
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-card-foreground mb-4">
              Average Performance ({rounds.length} round{rounds.length > 1 ? 's' : ''})
            </Text>
            
            {(() => {
              const holeAverages = calculateHoleAverages()!;
              const frontNine = holeAverages.slice(0, 9);
              const backNine = holeAverages.slice(9, 18);
              
              return (
                <>
                  {/* Front Nine */}
                  <View className="mb-4">
                    <Text className="text-md font-semibold text-card-foreground mb-2">Front 9</Text>
                    
                    {/* Header Row */}
                    <View className="flex-row border-b border-border pb-2 mb-2">
                      <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">Hole</Text>
                      {frontNine.map(avg => (
                        <Text key={avg.hole} className="flex-1 text-center text-xs font-semibold text-muted-foreground">
                          {avg.hole}
                        </Text>
                      ))}
                      <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">OUT</Text>
                    </View>
                    
                    {/* Par Row */}
                    <View className="flex-row border-b border-border pb-2 mb-2">
                      <Text className="flex-1 text-center text-sm font-medium text-foreground">Par</Text>
                      {frontNine.map(avg => (
                        <Text key={avg.hole} className="flex-1 text-center text-sm text-foreground">
                          {avg.par}
                        </Text>
                      ))}
                      <Text className="flex-1 text-center text-sm font-semibold text-foreground">
                        {frontNine.reduce((sum, avg) => sum + avg.par, 0)}
                      </Text>
                    </View>
                    
                    {/* Average Row */}
                    <View className="flex-row border-b border-border pb-2 mb-2">
                      <Text className="flex-1 text-center text-sm font-medium text-foreground">📊</Text>
                      {frontNine.map(avg => (
                        <Text 
                          key={avg.hole} 
                          className={`flex-1 text-center text-sm font-semibold ${getAverageScoreColor(avg.average, avg.par)}`}
                        >
                          {avg.average.toFixed(1)}
                        </Text>
                      ))}
                      <Text className="flex-1 text-center text-sm font-semibold text-primary">
                        {frontNine.reduce((sum, avg) => sum + avg.average, 0).toFixed(1)}
                      </Text>
                    </View>
                    
                    {/* Best/Worst Rows */}
                    <View className="flex-row mb-1">
                      <Text className="flex-1 text-center text-xs text-muted-foreground">🏆</Text>
                      {frontNine.map(avg => (
                        <Text key={avg.hole} className="flex-1 text-center text-xs text-green-600">
                          {avg.best}
                        </Text>
                      ))}
                      <Text className="flex-1 text-center text-xs text-green-600">
                        {frontNine.reduce((sum, avg) => sum + avg.best, 0)}
                      </Text>
                    </View>
                    
                    <View className="flex-row">
                      <Text className="flex-1 text-center text-xs text-muted-foreground">💀</Text>
                      {frontNine.map(avg => (
                        <Text key={avg.hole} className="flex-1 text-center text-xs text-red-600">
                          {avg.worst}
                        </Text>
                      ))}
                      <Text className="flex-1 text-center text-xs text-red-600">
                        {frontNine.reduce((sum, avg) => sum + avg.worst, 0)}
                      </Text>
                    </View>
                  </View>

                  {/* Back Nine (if exists) */}
                  {backNine.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-md font-semibold text-card-foreground mb-2">Back 9</Text>
                      
                      {/* Header Row */}
                      <View className="flex-row border-b border-border pb-2 mb-2">
                        <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">Hole</Text>
                        {backNine.map(avg => (
                          <Text key={avg.hole} className="flex-1 text-center text-xs font-semibold text-muted-foreground">
                            {avg.hole}
                          </Text>
                        ))}
                        <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">IN</Text>
                      </View>
                      
                      {/* Par Row */}
                      <View className="flex-row border-b border-border pb-2 mb-2">
                        <Text className="flex-1 text-center text-sm font-medium text-foreground">Par</Text>
                        {backNine.map(avg => (
                          <Text key={avg.hole} className="flex-1 text-center text-sm text-foreground">
                            {avg.par}
                          </Text>
                        ))}
                        <Text className="flex-1 text-center text-sm font-semibold text-foreground">
                          {backNine.reduce((sum, avg) => sum + avg.par, 0)}
                        </Text>
                      </View>
                      
                      {/* Average Row */}
                      <View className="flex-row border-b border-border pb-2 mb-2">
                        <Text className="flex-1 text-center text-sm font-medium text-foreground">📊</Text>
                        {backNine.map(avg => (
                          <Text 
                            key={avg.hole} 
                            className={`flex-1 text-center text-sm font-semibold ${getAverageScoreColor(avg.average, avg.par)}`}
                          >
                            {avg.average.toFixed(1)}
                          </Text>
                        ))}
                        <Text className="flex-1 text-center text-sm font-semibold text-primary">
                          {backNine.reduce((sum, avg) => sum + avg.average, 0).toFixed(1)}
                        </Text>
                      </View>
                      
                      {/* Best/Worst Rows */}
                      <View className="flex-row mb-1">
                        <Text className="flex-1 text-center text-xs text-muted-foreground">🏆</Text>
                        {backNine.map(avg => (
                          <Text key={avg.hole} className="flex-1 text-center text-xs text-green-600">
                            {avg.best}
                          </Text>
                        ))}
                        <Text className="flex-1 text-center text-xs text-green-600">
                          {backNine.reduce((sum, avg) => sum + avg.best, 0)}
                        </Text>
                      </View>
                      
                      <View className="flex-row">
                        <Text className="flex-1 text-center text-xs text-muted-foreground">💀</Text>
                        {backNine.map(avg => (
                          <Text key={avg.hole} className="flex-1 text-center text-xs text-red-600">
                            {avg.worst}
                          </Text>
                        ))}
                        <Text className="flex-1 text-center text-xs text-red-600">
                          {backNine.reduce((sum, avg) => sum + avg.worst, 0)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Total Row */}
                  <View className="border-t-2 border-primary pt-2">
                    <View className="flex-row mb-1">
                      <Text className="flex-1 text-center text-lg font-bold text-foreground">AVG TOTAL</Text>
                      <Text className="flex-1 text-center text-lg font-bold text-primary">
                        {holeAverages.reduce((sum, avg) => sum + avg.average, 0).toFixed(1)}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="flex-1 text-center text-sm text-muted-foreground">
                        vs Par: {holeAverages.reduce((sum, avg) => sum + avg.average, 0) - holeAverages.reduce((sum, avg) => sum + avg.par, 0) > 0 ? '+' : ''}{(holeAverages.reduce((sum, avg) => sum + avg.average, 0) - holeAverages.reduce((sum, avg) => sum + avg.par, 0)).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </>
              );
            })()}
          </Card>
        )}

        <Text className="text-lg font-semibold text-foreground mb-4">
          Previous Rounds ({rounds.length})
        </Text>

        {rounds.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-center">
              No rounds recorded yet. Add your first round to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={rounds.sort((a, b) => new Date(b.datePlayed).getTime() - new Date(a.datePlayed).getTime())}
            renderItem={renderRoundItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

          <Text className="text-lg font-semibold text-card-foreground mb-2 mt-8">Hole Notes</Text>
          <Text className="text-sm text-muted-foreground mb-4">
            Add personal notes for each hole to remember key strategies, hazards, or tips.
          </Text>
          
          {course?.holes.map((hole) => (
            <View key={hole.number} className="mb-4 p-3 border border-border rounded">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-card-foreground">
                  Hole {hole.number} • Par {hole.par}
                </Text>
                {editingNotes[hole.number] !== undefined && (
                  <Button
                    title={savingNotes ? "Saving..." : "Save"}
                    onPress={() => saveHoleNotes(hole.number)}
                    disabled={savingNotes}
                    className="py-1 px-3"
                  />
                )}
              </View>
              
              <Input
                value={editingNotes[hole.number] !== undefined ? editingNotes[hole.number] : (hole.notes || '')}
                onChangeText={(text) => handleNotesChange(hole.number, text)}
                placeholder={`Add notes for hole ${hole.number}...`}
                multiline
                numberOfLines={2}
                className="min-h-[60px]"
              />
              
              {hole.notes && editingNotes[hole.number] === undefined && (
                <Text className="text-xs text-muted-foreground mt-2">
                  Tap to edit notes
                </Text>
              )}
            </View>
          ))}
      </View>
    </ScrollView>
  );
};