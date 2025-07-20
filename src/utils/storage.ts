import { Course, Round } from '../types';
import { databaseService } from './database';

export const storageService = {
  async getCourses(): Promise<Course[]> {
    try {
      return await databaseService.getCourses();
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  },

  async saveCourse(course: Course): Promise<void> {
    try {
      await databaseService.saveCourse(course);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  },

  async getRounds(): Promise<Round[]> {
    try {
      return await databaseService.getRounds();
    } catch (error) {
      console.error('Error loading rounds:', error);
      return [];
    }
  },

  async saveRound(round: Round): Promise<void> {
    try {
      await databaseService.saveRound(round);
    } catch (error) {
      console.error('Error saving round:', error);
    }
  },

  async getRoundsByCourse(courseId: string): Promise<Round[]> {
    try {
      return await databaseService.getRounds(courseId);
    } catch (error) {
      console.error('Error loading rounds for course:', error);
      return [];
    }
  },

  async getRound(roundId: string): Promise<Round | null> {
    try {
      return await databaseService.getRound(roundId);
    } catch (error) {
      console.error('Error loading round:', error);
      return null;
    }
  },

  async deleteRound(roundId: string): Promise<void> {
    try {
      await databaseService.deleteRound(roundId);
    } catch (error) {
      console.error('Error deleting round:', error);
      throw error;
    }
  }
};