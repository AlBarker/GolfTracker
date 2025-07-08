import * as SQLite from 'expo-sqlite';
import { Course, Round, HoleScore, Hole } from '../types';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('parpal.db');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create tables
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS holes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        par INTEGER NOT NULL,
        handicap_index INTEGER NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS rounds (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        date_played TEXT NOT NULL,
        total_score INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS hole_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id TEXT NOT NULL,
        hole_number INTEGER NOT NULL,
        strokes INTEGER NOT NULL,
        putts INTEGER,
        fairway_hit TEXT,
        green_in_regulation INTEGER,
        penalty_shots INTEGER,
        up_and_down INTEGER,
        FOREIGN KEY (round_id) REFERENCES rounds (id) ON DELETE CASCADE
      );
    `);
  }

  // Course operations
  async saveCourse(course: Course): Promise<void> {
    this.db.runSync(
      'INSERT OR REPLACE INTO courses (id, name, created_at) VALUES (?, ?, ?)',
      [course.id, course.name, course.createdAt.toISOString()]
    );

    // Delete existing holes for this course
    this.db.runSync('DELETE FROM holes WHERE course_id = ?', [course.id]);

    // Insert holes
    for (const hole of course.holes) {
      this.db.runSync(
        'INSERT INTO holes (course_id, number, par, handicap_index) VALUES (?, ?, ?, ?)',
        [course.id, hole.number, hole.par, hole.handicapIndex]
      );
    }
  }

  async getCourses(): Promise<Course[]> {
    const coursesResult = this.db.getAllSync(
      'SELECT id, name, created_at FROM courses ORDER BY name'
    );

    const courses: Course[] = [];
    for (const courseRow of coursesResult) {
      const holesResult = this.db.getAllSync(
        'SELECT number, par, handicap_index FROM holes WHERE course_id = ? ORDER BY number',
        [courseRow.id]
      );

      const holes: Hole[] = holesResult.map(hole => ({
        number: hole.number as number,
        par: hole.par as number,
        handicapIndex: hole.handicap_index as number
      }));

      courses.push({
        id: courseRow.id as string,
        name: courseRow.name as string,
        holes,
        createdAt: new Date(courseRow.created_at as string)
      });
    }

    return courses;
  }

  async getCourse(id: string): Promise<Course | null> {
    const courseResult = this.db.getFirstSync(
      'SELECT id, name, created_at FROM courses WHERE id = ?',
      [id]
    );

    if (!courseResult) return null;

    const holesResult = this.db.getAllSync(
      'SELECT number, par, handicap_index FROM holes WHERE course_id = ? ORDER BY number',
      [id]
    );

    const holes: Hole[] = holesResult.map(hole => ({
      number: hole.number as number,
      par: hole.par as number,
      handicapIndex: hole.handicap_index as number
    }));

    return {
      id: courseResult.id as string,
      name: courseResult.name as string,
      holes,
      createdAt: new Date(courseResult.created_at as string)
    };
  }

  async deleteCourse(id: string): Promise<void> {
    this.db.runSync('DELETE FROM courses WHERE id = ?', [id]);
  }

  // Round operations
  async saveRound(round: Round): Promise<void> {
    this.db.runSync(
      'INSERT OR REPLACE INTO rounds (id, course_id, date_played, total_score, created_at) VALUES (?, ?, ?, ?, ?)',
      [round.id, round.courseId, round.datePlayed.toISOString(), round.totalScore, round.createdAt.toISOString()]
    );

    // Delete existing hole scores for this round
    this.db.runSync('DELETE FROM hole_scores WHERE round_id = ?', [round.id]);

    // Insert hole scores
    for (const holeScore of round.holes) {
      this.db.runSync(
        'INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          round.id,
          holeScore.holeNumber,
          holeScore.strokes,
          holeScore.putts || null,
          holeScore.fairwayHit || null,
          holeScore.greenInRegulation ? 1 : 0,
          holeScore.penaltyShots || null,
          holeScore.upAndDown ? 1 : 0
        ]
      );
    }
  }

  async getRounds(courseId?: string): Promise<Round[]> {
    const query = courseId 
      ? 'SELECT id, course_id, date_played, total_score, created_at FROM rounds WHERE course_id = ? ORDER BY date_played DESC'
      : 'SELECT id, course_id, date_played, total_score, created_at FROM rounds ORDER BY date_played DESC';
    
    const params = courseId ? [courseId] : [];
    const roundsResult = this.db.getAllSync(query, params);

    const rounds: Round[] = [];
    for (const roundRow of roundsResult) {
      const holeScoresResult = this.db.getAllSync(
        'SELECT hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down FROM hole_scores WHERE round_id = ? ORDER BY hole_number',
        [roundRow.id]
      );

      const holes: HoleScore[] = holeScoresResult.map(score => ({
        holeNumber: score.hole_number as number,
        strokes: score.strokes as number,
        putts: score.putts as number | undefined,
        fairwayHit: score.fairway_hit as 'hit' | 'left' | 'right' | undefined,
        greenInRegulation: score.green_in_regulation ? true : false,
        penaltyShots: score.penalty_shots as number | undefined,
        upAndDown: score.up_and_down ? true : false
      }));

      rounds.push({
        id: roundRow.id as string,
        courseId: roundRow.course_id as string,
        datePlayed: new Date(roundRow.date_played as string),
        holes,
        totalScore: roundRow.total_score as number,
        createdAt: new Date(roundRow.created_at as string)
      });
    }

    return rounds;
  }

  async getRound(id: string): Promise<Round | null> {
    const roundResult = this.db.getFirstSync(
      'SELECT id, course_id, date_played, total_score, created_at FROM rounds WHERE id = ?',
      [id]
    );

    if (!roundResult) return null;

    const holeScoresResult = this.db.getAllSync(
      'SELECT hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down FROM hole_scores WHERE round_id = ? ORDER BY hole_number',
      [id]
    );

    const holes: HoleScore[] = holeScoresResult.map(score => ({
      holeNumber: score.hole_number as number,
      strokes: score.strokes as number,
      putts: score.putts as number | undefined,
      fairwayHit: score.fairway_hit as 'hit' | 'left' | 'right' | undefined,
      greenInRegulation: score.green_in_regulation ? true : false,
      penaltyShots: score.penalty_shots as number | undefined,
      upAndDown: score.up_and_down ? true : false
    }));

    return {
      id: roundResult.id as string,
      courseId: roundResult.course_id as string,
      datePlayed: new Date(roundResult.date_played as string),
      holes,
      totalScore: roundResult.total_score as number,
      createdAt: new Date(roundResult.created_at as string)
    };
  }

  async deleteRound(id: string): Promise<void> {
    this.db.runSync('DELETE FROM rounds WHERE id = ?', [id]);
  }

  // Get all rounds for statistics
  async getAllRounds(): Promise<Round[]> {
    return this.getRounds();
  }
}

export const databaseService = new DatabaseService();