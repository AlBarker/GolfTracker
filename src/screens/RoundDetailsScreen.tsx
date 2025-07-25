import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Course, Round } from '../types';
import { BackArrow, Button, Card, LoadingSpinner } from '../components/ui';
import { storageService } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'RoundDetails'>;

export const RoundDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roundId } = route.params;
  const insets = useSafeAreaInsets();
  const [round, setRound] = useState<Round | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRoundData();
  }, [roundId]);

  useFocusEffect(
    React.useCallback(() => {
      loadRoundData();
    }, [roundId])
  );

  const loadRoundData = async () => {
    try {
      const rounds = await storageService.getRounds();
      const foundRound = rounds.find(r => r.id === roundId);
      setRound(foundRound || null);

      if (foundRound) {
        const courses = await storageService.getCourses();
        const foundCourse = courses.find(c => c.id === foundRound.courseId);
        setCourse(foundCourse || null);
      }
    } catch (error) {
      console.error('Error loading round data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRound = () => {
    Alert.alert(
      'Delete Round',
      'Are you sure you want to delete this round? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await storageService.deleteRound(roundId);
              Alert.alert('Success', 'Round deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete round');
              console.error('Error deleting round:', error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return 'text-blue-600'; // Eagle or better
    if (diff === -1) return 'text-green-600'; // Birdie
    if (diff === 0) return 'text-foreground'; // Par
    if (diff === 1) return 'text-yellow-600'; // Bogey
    if (diff === 2) return 'text-orange-600'; // Double bogey
    return 'text-red-600'; // Triple bogey or worse
  };

  const getScoreName = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -3) return 'Albatross';
    if (diff === -2) return 'Eagle';
    if (diff === -1) return 'Birdie';
    if (diff === 0) return 'Par';
    if (diff === 1) return 'Bogey';
    if (diff === 2) return 'Double Bogey';
    if (diff === 3) return 'Triple Bogey';
    return `+${diff}`;
  };

  const calculateStats = () => {
    if (!round || !course) return null;

    const totalPutts = round.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const totalPenalties = round.holes.reduce((sum, hole) => sum + (hole.penaltyShots || 0), 0);
    const fairwaysHit = round.holes.filter(hole => hole.fairwayHit === 'hit').length;
    const fairwaysTracked = round.holes.filter(hole => hole.fairwayHit).length;
    const fairwaysMissedLeft = round.holes.filter(hole => hole.fairwayHit === 'left').length;
    const fairwaysMissedRight = round.holes.filter(hole => hole.fairwayHit === 'right').length;
    const girsHit = round.holes.filter(hole => hole.greenInRegulation).length;
    const upAndDowns = round.holes.filter(hole => hole.upAndDown).length;
    
    // Calculate par for only the holes that were played
    const playedHoleNumbers = round.holes.map(score => score.holeNumber);
    const playedCourseHoles = course.holes.filter(hole => playedHoleNumbers.includes(hole.number));
    const coursePar = playedCourseHoles.reduce((sum, hole) => sum + hole.par, 0);

    return {
      totalPutts,
      totalPenalties,
      fairwayPercentage: fairwaysTracked > 0 ? (fairwaysHit / fairwaysTracked) * 100 : 0,
      fairwayMissedLeftPercentage: fairwaysTracked > 0 ? (fairwaysMissedLeft / fairwaysTracked) * 100 : 0,
      fairwayMissedRightPercentage: fairwaysTracked > 0 ? (fairwaysMissedRight / fairwaysTracked) * 100 : 0,
      girPercentage: (girsHit / round.holes.length) * 100,
      upAndDownPercentage: upAndDowns > 0 ? (upAndDowns / round.holes.length) * 100 : 0,
      coursePar,
      scoreToPar: round.totalScore - coursePar
    };
  };

  if (loading) {
    return <LoadingSpinner message="Loading round details..." />;
  }

  if (!round || !course) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-muted-foreground">Round not found</Text>
      </View>
    );
  }

  const stats = calculateStats();
  
  // Detect which holes were actually played by examining the round data
  const playedHoleNumbers = round.holes.map(score => score.holeNumber).sort((a, b) => a - b);
  const isFrontNineOnly = playedHoleNumbers.every(num => num >= 1 && num <= 9);
  const isBackNineOnly = playedHoleNumbers.every(num => num >= 10 && num <= 18);
  const isFullRound = playedHoleNumbers.length === 18;
  
  // Get the actual holes that were played
  const playedHoles = course.holes.filter(hole => playedHoleNumbers.includes(hole.number));
  
  // For display purposes, organize the holes
  let frontNine: any[] = [];
  let backNine: any[] = [];
  let frontNineScores: any[] = [];
  let backNineScores: any[] = [];
  
  if (isFrontNineOnly) {
    frontNine = playedHoles;
    frontNineScores = round.holes;
  } else if (isBackNineOnly) {
    backNine = playedHoles;
    backNineScores = round.holes;
  } else {
    // Full round or mixed holes - keep original logic
    frontNine = course.holes.slice(0, 9);
    backNine = course.holes.slice(9, 18);
    frontNineScores = round.holes.slice(0, 9);
    backNineScores = round.holes.slice(9, 18);
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center mb-4">
          <BackArrow />
          <Text className="text-2xl font-bold text-foreground ml-4">Round Details</Text>
        </View>
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-2">{course.name}</Text>
          <Text className="text-muted-foreground mb-2">{formatDate(round.datePlayed)}</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-primary">{round.totalScore}</Text>
              <Text className="text-muted-foreground">Total Score</Text>
            </View>
            <View className="items-end">
              <Text className={`text-2xl font-bold ${stats && getScoreColor(round.totalScore, stats.coursePar)}`}>
                {stats && stats.scoreToPar > 0 ? '+' : ''}{stats?.scoreToPar}
              </Text>
              <Text className="text-muted-foreground">vs Par</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-6">
          <Button
            title="Edit Round"
            variant="outline"
            onPress={() => navigation.navigate('RoundEntry', { courseId: course.id, roundId: round.id })}
            className="flex-1"
          />
          <Button
            title={deleting ? "Deleting..." : "Delete Round"}
            variant="destructive"
            onPress={handleDeleteRound}
            disabled={deleting}
            className="flex-1"
          />
        </View>

        {/* Scorecard */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-4">Scorecard</Text>
          
          {/* Front Nine */}
          {frontNine.length > 0 && (
            <View className="mb-4">
              <Text className="text-md font-semibold text-card-foreground mb-2">
                {isFrontNineOnly ? 'Front 9 (Holes 1-9)' : 'Front 9'}
              </Text>
            
            {/* Header Row */}
            <View className="flex-row border-b border-border pb-2 mb-2">
              <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">Hole</Text>
              {frontNine.map(hole => (
                <Text key={hole.number} className="flex-1 text-center text-xs font-semibold text-muted-foreground">
                  {hole.number}
                </Text>
              ))}
              <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">OUT</Text>
            </View>
            
            {/* Par Row */}
            <View className="flex-row border-b border-border pb-2 mb-2">
              <Text className="flex-1 text-center text-sm font-medium text-foreground">Par</Text>
              {frontNine.map(hole => (
                <Text key={hole.number} className="flex-1 text-center text-sm text-foreground">
                  {hole.par}
                </Text>
              ))}
              <Text className="flex-1 text-center text-sm font-semibold text-foreground">
                {frontNine.reduce((sum, hole) => sum + hole.par, 0)}
              </Text>
            </View>
            
            {/* Score Row */}
            <View className="flex-row border-b border-border pb-2 mb-2">
              <Text className="flex-1 text-center text-sm font-medium text-foreground">🏌️</Text>
              {frontNineScores.map((holeScore, index) => {
                const hole = frontNine[index];
                return (
                  <Text 
                    key={hole.number} 
                    className={`flex-1 text-center text-sm font-semibold ${getScoreColor(holeScore.strokes, hole.par)}`}
                  >
                    {holeScore.strokes}
                  </Text>
                );
              })}
              <Text className="flex-1 text-center text-sm font-semibold text-primary">
                {frontNineScores.reduce((sum, hole) => sum + hole.strokes, 0)}
              </Text>
            </View>
            
            {/* Putts Row (if any putts recorded) */}
            {round.holes.some(hole => hole.putts) && (
              <View className="flex-row">
                <Text className="flex-1 text-center text-xs text-muted-foreground">⛳</Text>
                {frontNineScores.map((holeScore, index) => (
                  <Text key={frontNine[index].number} className="flex-1 text-center text-xs text-muted-foreground">
                    {holeScore.putts || '-'}
                  </Text>
                ))}
                <Text className="flex-1 text-center text-xs text-muted-foreground">
                  {frontNineScores.reduce((sum, hole) => sum + (hole.putts || 0), 0)}
                </Text>
                </View>
              )}
            </View>
          )}

          {/* Back Nine (if exists) */}
          {backNine.length > 0 && (
            <View className="mb-4">
              <Text className="text-md font-semibold text-card-foreground mb-2">
                {isBackNineOnly ? 'Back 9 (Holes 10-18)' : 'Back 9'}
              </Text>
              
              {/* Header Row */}
              <View className="flex-row border-b border-border pb-2 mb-2">
                <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">Hole</Text>
                {backNine.map(hole => (
                  <Text key={hole.number} className="flex-1 text-center text-xs font-semibold text-muted-foreground">
                    {hole.number}
                  </Text>
                ))}
                <Text className="flex-1 text-center text-xs font-semibold text-muted-foreground">IN</Text>
              </View>
              
              {/* Par Row */}
              <View className="flex-row border-b border-border pb-2 mb-2">
                <Text className="flex-1 text-center text-sm font-medium text-foreground">Par</Text>
                {backNine.map(hole => (
                  <Text key={hole.number} className="flex-1 text-center text-sm text-foreground">
                    {hole.par}
                  </Text>
                ))}
                <Text className="flex-1 text-center text-sm font-semibold text-foreground">
                  {backNine.reduce((sum, hole) => sum + hole.par, 0)}
                </Text>
              </View>
              
              {/* Score Row */}
              <View className="flex-row border-b border-border pb-2 mb-2">
                <Text className="flex-1 text-center text-sm font-medium text-foreground">🏌️</Text>
                {backNineScores.map((holeScore, index) => {
                  const hole = backNine[index];
                  return (
                    <Text 
                      key={hole.number} 
                      className={`flex-1 text-center text-sm font-semibold ${getScoreColor(holeScore.strokes, hole.par)}`}
                    >
                      {holeScore.strokes}
                    </Text>
                  );
                })}
                <Text className="flex-1 text-center text-sm font-semibold text-primary">
                  {backNineScores.reduce((sum, hole) => sum + hole.strokes, 0)}
                </Text>
              </View>
              
              {/* Putts Row (if any putts recorded) */}
              {round.holes.some(hole => hole.putts) && (
                <View className="flex-row">
                  <Text className="flex-1 text-center text-xs text-muted-foreground">⛳</Text>
                  {backNineScores.map((holeScore, index) => (
                    <Text key={backNine[index].number} className="flex-1 text-center text-xs text-muted-foreground">
                      {holeScore.putts || '-'}
                    </Text>
                  ))}
                  <Text className="flex-1 text-center text-xs text-muted-foreground">
                    {backNineScores.reduce((sum, hole) => sum + (hole.putts || 0), 0)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Total Row */}
          <View className="border-t-2 border-primary pt-2">
            <View className="flex-row">
              <Text className="flex-1 text-center text-lg font-bold text-foreground">
                {isFrontNineOnly || isBackNineOnly ? 'TOTAL (9 holes)' : 'TOTAL'}
              </Text>
              <Text className="flex-1 text-center text-lg font-bold text-primary">{round.totalScore}</Text>
            </View>
          </View>
        </Card>

        {/* Round Statistics */}
        {stats && (
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-card-foreground mb-4">Round Statistics</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Total Score:</Text>
                <Text className="font-semibold text-card-foreground">{round.totalScore}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">vs Par:</Text>
                <Text className={`font-semibold ${getScoreColor(round.totalScore, stats.coursePar)}`}>
                  {stats.scoreToPar > 0 ? '+' : ''}{stats.scoreToPar}
                </Text>
              </View>

              {stats.totalPutts > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Total Putts:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.totalPutts}</Text>
                </View>
              )}

              {stats.totalPenalties > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Penalty Shots:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.totalPenalties}</Text>
                </View>
              )}

              {(stats.fairwayPercentage > 0 || stats.fairwayMissedLeftPercentage > 0 || stats.fairwayMissedRightPercentage > 0) && (
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-muted-foreground">Fairways Hit:</Text>
                    <Text className="font-semibold text-card-foreground">{stats.fairwayPercentage.toFixed(1)}%</Text>
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

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Greens in Regulation:</Text>
                <Text className="font-semibold text-card-foreground">{stats.girPercentage.toFixed(1)}%</Text>
              </View>

              {stats.upAndDownPercentage > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Up & Down:</Text>
                  <Text className="font-semibold text-card-foreground">{stats.upAndDownPercentage.toFixed(1)}%</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Best Holes */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-card-foreground mb-4">Notable Holes</Text>
          
          {round.holes.map((holeScore) => {
            const hole = course.holes.find(h => h.number === holeScore.holeNumber);
            if (!hole) return null;
            const scoreName = getScoreName(holeScore.strokes, hole.par);
            
            // Only show notable scores (birdie or better, or double bogey or worse)
            const diff = holeScore.strokes - hole.par;
            if (diff <= -1 || diff >= 2) {
              return (
                <View key={hole.number} className="flex-row justify-between items-center py-2 border-b border-border">
                  <View>
                    <Text className="font-semibold text-card-foreground">Hole {hole.number}</Text>
                    <Text className="text-xs text-muted-foreground">Par {hole.par}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-lg font-bold ${getScoreColor(holeScore.strokes, hole.par)}`}>
                      {holeScore.strokes}
                    </Text>
                    <Text className={`text-xs ${getScoreColor(holeScore.strokes, hole.par)}`}>
                      {scoreName}
                    </Text>
                  </View>
                </View>
              );
            }
            return null;
          }).filter(Boolean)}
          
          {round.holes.every((holeScore) => {
            const hole = course.holes.find(h => h.number === holeScore.holeNumber);
            if (!hole) return true;
            const diff = holeScore.strokes - hole.par;
            return diff > -1 && diff < 2;
          }) && (
            <Text className="text-muted-foreground text-center py-4">
              No birdies, eagles, or double bogeys this round
            </Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};