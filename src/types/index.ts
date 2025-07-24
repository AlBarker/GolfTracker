export interface Course {
  id: string;
  userId: string;
  name: string;
  holes: Hole[];
  createdAt: Date;
}

export interface Hole {
  number: number;
  par: number;
  handicapIndex: number;
  notes?: string;
}

export interface Round {
  id: string;
  courseId: string;
  datePlayed: Date;
  holes: HoleScore[];
  totalScore: number;
  createdAt: Date;
  deletedAt?: Date;
}

export interface HoleScore {
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: 'hit' | 'left' | 'right';
  greenInRegulation?: boolean | null;
  penaltyShots?: number;
  upAndDown?: boolean | null;
}

export interface RoundStats {
  totalRounds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averagePutts: number;
  fairwayHitPercentage: number;
  fairwayMissedLeftPercentage: number;
  fairwayMissedRightPercentage: number;
  greenInRegulationPercentage: number;
  upAndDownPercentage: number;
}

export type HoleSelection = 'front9' | 'back9' | '18holes';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  CourseDetails: { courseId: string };
  AddCourse: undefined;
  RoundEntry: { courseId: string; roundId?: string; holeSelection?: HoleSelection };
  HandicapEntry: { courseId: string };
  LiveScoring: { courseId: string; handicap?: number; targetScore?: number; holeSelection?: HoleSelection };
  RoundDetails: { roundId: string };
  Login: undefined;
  SignUp: undefined;
};