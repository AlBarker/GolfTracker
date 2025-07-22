import { supabase } from './supabase';
import { Course, Round, HoleScore, Hole } from '../types';

export class DatabaseService {
  constructor() {
    // No local database initialization needed with Supabase
  }

  // Course operations
  async saveCourse(course: Course): Promise<void> {
    // Insert or update course
    const { error: courseError } = await supabase
      .from('courses')
      .upsert({
        id: course.id,
        user_id: course.userId,
        name: course.name,
        created_at: course.createdAt.toISOString()
      });

    if (courseError) {
      throw new Error(`Failed to save course: ${courseError.message}`);
    }

    // Delete existing holes for this course
    const { error: deleteError } = await supabase
      .from('holes')
      .delete()
      .eq('course_id', course.id);

    if (deleteError) {
      throw new Error(`Failed to delete existing holes: ${deleteError.message}`);
    }

    // Insert holes
    const holesData = course.holes.map(hole => ({
      course_id: course.id,
      number: hole.number,
      par: hole.par,
      handicap_index: hole.handicapIndex,
      notes: hole.notes || null
    }));

    const { error: holesError } = await supabase
      .from('holes')
      .insert(holesData);

    if (holesError) {
      throw new Error(`Failed to save holes: ${holesError.message}`);
    }
  }

  async getCourses(): Promise<Course[]> {
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id, user_id, name, created_at')
      .order('name');

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    const courses: Course[] = [];
    for (const courseRow of coursesData || []) {
      const { data: holesData, error: holesError } = await supabase
        .from('holes')
        .select('number, par, handicap_index, notes')
        .eq('course_id', courseRow.id)
        .order('number');

      if (holesError) {
        throw new Error(`Failed to fetch holes for course ${courseRow.id}: ${holesError.message}`);
      }

      const holes: Hole[] = (holesData || []).map(hole => ({
        number: hole.number,
        par: hole.par,
        handicapIndex: hole.handicap_index,
        notes: hole.notes || undefined
      }));

      courses.push({
        id: courseRow.id,
        userId: courseRow.user_id,
        name: courseRow.name,
        holes,
        createdAt: new Date(courseRow.created_at)
      });
    }

    return courses;
  }

  async getCourse(id: string): Promise<Course | null> {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, user_id, name, created_at')
      .eq('id', id)
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch course: ${courseError.message}`);
    }

    const { data: holesData, error: holesError } = await supabase
      .from('holes')
      .select('number, par, handicap_index, notes')
      .eq('course_id', id)
      .order('number');

    if (holesError) {
      throw new Error(`Failed to fetch holes for course ${id}: ${holesError.message}`);
    }

    const holes: Hole[] = (holesData || []).map(hole => ({
      number: hole.number,
      par: hole.par,
      handicapIndex: hole.handicap_index,
      notes: hole.notes || undefined
    }));

    return {
      id: courseData.id,
      userId: courseData.user_id,
      name: courseData.name,
      holes,
      createdAt: new Date(courseData.created_at)
    };
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // Round operations
  async saveRound(round: Round): Promise<void> {
    // Insert or update round
    const { error: roundError } = await supabase
      .from('rounds')
      .upsert({
        id: round.id,
        course_id: round.courseId,
        date_played: round.datePlayed.toISOString(),
        total_score: round.totalScore,
        created_at: round.createdAt.toISOString(),
        deleted_at: round.deletedAt?.toISOString() || null
      });

    if (roundError) {
      throw new Error(`Failed to save round: ${roundError.message}`);
    }

    // Delete existing hole scores for this round
    const { error: deleteError } = await supabase
      .from('hole_scores')
      .delete()
      .eq('round_id', round.id);

    if (deleteError) {
      throw new Error(`Failed to delete existing hole scores: ${deleteError.message}`);
    }

    // Insert hole scores
    const holeScoresData = round.holes.map(holeScore => ({
      round_id: round.id,
      hole_number: holeScore.holeNumber,
      strokes: holeScore.strokes,
      putts: holeScore.putts || null,
      fairway_hit: holeScore.fairwayHit || null,
      green_in_regulation: holeScore.greenInRegulation || false,
      penalty_shots: holeScore.penaltyShots || 0,
      up_and_down: holeScore.upAndDown || false
    }));

    const { error: holeScoresError } = await supabase
      .from('hole_scores')
      .insert(holeScoresData);

    if (holeScoresError) {
      throw new Error(`Failed to save hole scores: ${holeScoresError.message}`);
    }
  }

  async getRounds(courseId?: string): Promise<Round[]> {
    let query = supabase
      .from('rounds')
      .select('id, course_id, date_played, total_score, created_at, deleted_at')
      .is('deleted_at', null)
      .order('date_played', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: roundsData, error: roundsError } = await query;

    if (roundsError) {
      throw new Error(`Failed to fetch rounds: ${roundsError.message}`);
    }

    const rounds: Round[] = [];
    for (const roundRow of roundsData || []) {
      const { data: holeScoresData, error: holeScoresError } = await supabase
        .from('hole_scores')
        .select('hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down')
        .eq('round_id', roundRow.id)
        .order('hole_number');

      if (holeScoresError) {
        throw new Error(`Failed to fetch hole scores for round ${roundRow.id}: ${holeScoresError.message}`);
      }

      const holes: HoleScore[] = (holeScoresData || []).map(score => ({
        holeNumber: score.hole_number,
        strokes: score.strokes,
        putts: score.putts || undefined,
        fairwayHit: score.fairway_hit as 'hit' | 'left' | 'right' | undefined,
        greenInRegulation: score.green_in_regulation,
        penaltyShots: score.penalty_shots || undefined,
        upAndDown: score.up_and_down
      }));

      rounds.push({
        id: roundRow.id,
        courseId: roundRow.course_id,
        datePlayed: new Date(roundRow.date_played),
        holes,
        totalScore: roundRow.total_score,
        createdAt: new Date(roundRow.created_at),
        deletedAt: roundRow.deleted_at ? new Date(roundRow.deleted_at) : undefined
      });
    }

    return rounds;
  }

  async getRound(id: string): Promise<Round | null> {
    const { data: roundData, error: roundError } = await supabase
      .from('rounds')
      .select('id, course_id, date_played, total_score, created_at, deleted_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (roundError) {
      if (roundError.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch round: ${roundError.message}`);
    }

    const { data: holeScoresData, error: holeScoresError } = await supabase
      .from('hole_scores')
      .select('hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down')
      .eq('round_id', id)
      .order('hole_number');

    if (holeScoresError) {
      throw new Error(`Failed to fetch hole scores for round ${id}: ${holeScoresError.message}`);
    }

    const holes: HoleScore[] = (holeScoresData || []).map(score => ({
      holeNumber: score.hole_number,
      strokes: score.strokes,
      putts: score.putts || undefined,
      fairwayHit: score.fairway_hit as 'hit' | 'left' | 'right' | undefined,
      greenInRegulation: score.green_in_regulation,
      penaltyShots: score.penalty_shots || undefined,
      upAndDown: score.up_and_down
    }));

    return {
      id: roundData.id,
      courseId: roundData.course_id,
      datePlayed: new Date(roundData.date_played),
      holes,
      totalScore: roundData.total_score,
      createdAt: new Date(roundData.created_at),
      deletedAt: roundData.deleted_at ? new Date(roundData.deleted_at) : undefined
    };
  }

  async deleteRound(id: string): Promise<void> {
    const { error } = await supabase
      .from('rounds')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete round: ${error.message}`);
    }
  }

  // Get all rounds for statistics
  async getAllRounds(): Promise<Round[]> {
    return this.getRounds();
  }

  // Hole notes operations
  async updateHoleNotes(courseId: string, holeNumber: number, notes: string): Promise<void> {
    const { error } = await supabase
      .from('holes')
      .update({ notes: notes || null })
      .eq('course_id', courseId)
      .eq('number', holeNumber);

    if (error) {
      throw new Error(`Failed to update hole notes: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService();