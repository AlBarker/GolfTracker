import { Round, RoundStats, Course } from '../types';
import { databaseService } from './database';

export const calculateRoundStats = (rounds: Round[], course: Course): RoundStats => {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      averagePutts: 0,
      fairwayHitPercentage: 0,
      fairwayMissedLeftPercentage: 0,
      fairwayMissedRightPercentage: 0,
      greenInRegulationPercentage: 0,
      upAndDownPercentage: 0,
    };
  }

  const totalRounds = rounds.length;
  const scores = rounds.map(round => round.totalScore);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalRounds;
  const bestScore = Math.min(...scores);
  const worstScore = Math.max(...scores);

  const holesWithPutts = rounds.flatMap(round => 
    round.holes.filter(hole => hole.putts !== undefined)
  );
  const averagePutts = holesWithPutts.length > 0 
    ? holesWithPutts.reduce((sum, hole) => sum + (hole.putts || 0), 0) / holesWithPutts.length 
    : 0;

  const holesWithFairwayData = rounds.flatMap(round => 
    round.holes.filter(hole => hole.fairwayHit !== undefined)
  );
  const fairwayHits = holesWithFairwayData.filter(hole => hole.fairwayHit === 'hit').length;
  const fairwayMissedLeft = holesWithFairwayData.filter(hole => hole.fairwayHit === 'left').length;
  const fairwayMissedRight = holesWithFairwayData.filter(hole => hole.fairwayHit === 'right').length;
  
  const fairwayHitPercentage = holesWithFairwayData.length > 0 
    ? (fairwayHits / holesWithFairwayData.length) * 100 
    : 0;
  const fairwayMissedLeftPercentage = holesWithFairwayData.length > 0 
    ? (fairwayMissedLeft / holesWithFairwayData.length) * 100 
    : 0;
  const fairwayMissedRightPercentage = holesWithFairwayData.length > 0 
    ? (fairwayMissedRight / holesWithFairwayData.length) * 100 
    : 0;

  const holesWithGIRData = rounds.flatMap(round => 
    round.holes.filter(hole => hole.greenInRegulation !== undefined && hole.greenInRegulation !== null)
  );
  const girHits = holesWithGIRData.filter(hole => hole.greenInRegulation === true).length;
  const greenInRegulationPercentage = holesWithGIRData.length > 0 
    ? (girHits / holesWithGIRData.length) * 100 
    : 0;

  const holesWithUpAndDownData = rounds.flatMap(round => 
    round.holes.filter(hole => hole.upAndDown !== undefined && hole.upAndDown !== null)
  );
  const upAndDownSuccess = holesWithUpAndDownData.filter(hole => hole.upAndDown === true).length;
  const upAndDownPercentage = holesWithUpAndDownData.length > 0 
    ? (upAndDownSuccess / holesWithUpAndDownData.length) * 100 
    : 0;

  return {
    totalRounds,
    averageScore,
    bestScore,
    worstScore,
    averagePutts,
    fairwayHitPercentage,
    fairwayMissedLeftPercentage,
    fairwayMissedRightPercentage,
    greenInRegulationPercentage,
    upAndDownPercentage,
  };
};

export const calculateRoundTotal = (holes: any[], course: Course): number => {
  return holes.reduce((total, hole) => total + (hole.strokes || 0), 0);
};

export const getRoundStatistics = async (courseId?: string): Promise<RoundStats> => {
  try {
    const rounds = await databaseService.getRounds(courseId);
    if (courseId) {
      const course = await databaseService.getCourse(courseId);
      if (course) {
        return calculateRoundStats(rounds, course);
      }
    }
    const courses = await databaseService.getCourses();
    const defaultCourse = courses[0];
    return calculateRoundStats(rounds, defaultCourse || { id: '', name: '', holes: [], createdAt: new Date() });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return {
      totalRounds: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      averagePutts: 0,
      fairwayHitPercentage: 0,
      fairwayMissedLeftPercentage: 0,
      fairwayMissedRightPercentage: 0,
      greenInRegulationPercentage: 0,
      upAndDownPercentage: 0,
    };
  }
};