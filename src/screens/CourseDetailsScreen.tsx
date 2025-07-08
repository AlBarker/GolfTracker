import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round, RoundStats } from '../types';
import { BackArrow, Button, Card } from '../components/ui';
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
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-muted-foreground">Loading course...</Text>
      </View>
    );
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
            onPress={() => navigation.navigate('LiveScoring', { courseId })}
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
              {stats.fairwayHitPercentage > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Fairway Hit %:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.fairwayHitPercentage.toFixed(1)}%</Text>
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
      </View>
    </ScrollView>
  );
};