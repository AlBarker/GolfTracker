export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  createdAt: Date;
}

export interface Hole {
  number: number;
  par: number;
  handicapIndex: number;
}

export interface Round {
  id: string;
  courseId: string;
  datePlayed: Date;
  holes: HoleScore[];
  totalScore: number;
  createdAt: Date;
}

export interface HoleScore {
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: 'hit' | 'left' | 'right';
  greenInRegulation?: boolean;
  penaltyShots?: number;
  upAndDown?: boolean;
}

export interface RoundStats {
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averagePutts: number;
  fairwayHitPercentage: number;
  greenInRegulationPercentage: number;
  upAndDownPercentage: number;
}

export type RootStackParamList = {
  Home: undefined;
  CourseDetails: { courseId: string };
  AddCourse: undefined;
  RoundEntry: { courseId: string; roundId?: string };
  LiveScoring: { courseId: string };
  RoundDetails: { roundId: string };
};