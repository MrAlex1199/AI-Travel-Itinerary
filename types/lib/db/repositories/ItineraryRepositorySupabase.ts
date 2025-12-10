/**
 * Itinerary Repository (Supabase Implementation)
 * 
 * Handles all database operations related to itineraries using Supabase.
 */

import { Itinerary, DailySchedule, Activity, Recommendation } from '@/types';
import { supabase } from '../supabase';

export interface IItineraryRepository {
  create(itinerary: Omit<Itinerary, 'id' | 'generatedAt'> & { userId: string }): Promise<Itinerary>;
  findById(id: string): Promise<Itinerary | null>;
  findByUserId(userId: string): Promise<Itinerary[]>;
  delete(id: string): Promise<boolean>;
}

export class ItineraryRepositorySupabase implements IItineraryRepository {
  /**
   * Create a new itinerary with all related data
   */
  async create(
    data: Omit<Itinerary, 'id' | 'generatedAt'> & { userId: string }
  ): Promise<Itinerary> {
    // Insert itinerary
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itineraries')
      .insert({
        user_id: data.userId,
        destination: data.destination,
        duration: data.duration,
      })
      .select()
      .single();

    if (itineraryError || !itineraryData) {
      throw new Error(`Failed to create itinerary: ${itineraryError?.message}`);
    }

    const itineraryId = itineraryData.id;

    // Insert daily schedules and activities
    for (const schedule of data.dailySchedules) {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('daily_schedules')
        .insert({
          itinerary_id: itineraryId,
          day: schedule.day,
        })
        .select()
        .single();

      if (scheduleError || !scheduleData) {
        throw new Error(`Failed to create daily schedule: ${scheduleError?.message}`);
      }

      // Insert activities for this schedule
      if (schedule.activities && schedule.activities.length > 0) {
        const activitiesData = schedule.activities.map((activity, index) => ({
          daily_schedule_id: scheduleData.id,
          time: activity.time,
          name: activity.name,
          location: activity.location,
          description: activity.description,
          icon: activity.icon || null,
          order_index: index,
        }));

        const { error: activitiesError } = await supabase
          .from('activities')
          .insert(activitiesData);

        if (activitiesError) {
          throw new Error(`Failed to create activities: ${activitiesError.message}`);
        }
      }
    }

    // Insert recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      const recommendationsData = data.recommendations.map((rec) => ({
        itinerary_id: itineraryId,
        category: rec.category,
        name: rec.name,
        description: rec.description,
        location: rec.location || null,
      }));

      const { error: recsError } = await supabase
        .from('recommendations')
        .insert(recommendationsData);

      if (recsError) {
        throw new Error(`Failed to create recommendations: ${recsError.message}`);
      }
    }

    // Fetch and return the complete itinerary
    const completeItinerary = await this.findById(itineraryId);
    if (!completeItinerary) {
      throw new Error('Failed to retrieve created itinerary');
    }

    return completeItinerary;
  }

  /**
   * Find itinerary by ID with all related data
   */
  async findById(id: string): Promise<Itinerary | null> {
    // Fetch itinerary
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single();

    if (itineraryError || !itineraryData) {
      return null;
    }

    // Fetch daily schedules
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('daily_schedules')
      .select('*')
      .eq('itinerary_id', id)
      .order('day', { ascending: true });

    if (schedulesError) {
      throw new Error(`Failed to fetch schedules: ${schedulesError.message}`);
    }

    // Fetch activities for each schedule
    const dailySchedules: DailySchedule[] = [];
    for (const schedule of schedulesData || []) {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('daily_schedule_id', schedule.id)
        .order('order_index', { ascending: true });

      if (activitiesError) {
        throw new Error(`Failed to fetch activities: ${activitiesError.message}`);
      }

      const activities: Activity[] = (activitiesData || []).map((act) => ({
        time: act.time,
        name: act.name,
        location: act.location,
        description: act.description,
        icon: act.icon || undefined,
      }));

      dailySchedules.push({
        day: schedule.day,
        activities,
      });
    }

    // Fetch recommendations
    const { data: recsData, error: recsError } = await supabase
      .from('recommendations')
      .select('*')
      .eq('itinerary_id', id);

    if (recsError) {
      throw new Error(`Failed to fetch recommendations: ${recsError.message}`);
    }

    const recommendations: Recommendation[] = (recsData || []).map((rec) => ({
      id: rec.id,
      category: rec.category as 'place' | 'restaurant' | 'experience',
      name: rec.name,
      description: rec.description,
      location: rec.location || undefined,
    }));

    return {
      id: itineraryData.id,
      destination: itineraryData.destination,
      duration: itineraryData.duration,
      dailySchedules,
      recommendations,
      generatedAt: new Date(itineraryData.generated_at),
    };
  }

  /**
   * Find all itineraries for a user
   * Returns itineraries in reverse chronological order (newest first)
   */
  async findByUserId(userId: string): Promise<Itinerary[]> {
    const { data: itinerariesData, error } = await supabase
      .from('itineraries')
      .select('id')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user itineraries: ${error.message}`);
    }

    const itineraries: Itinerary[] = [];
    for (const itinerary of itinerariesData || []) {
      const fullItinerary = await this.findById(itinerary.id);
      if (fullItinerary) {
        itineraries.push(fullItinerary);
      }
    }

    return itineraries;
  }

  /**
   * Delete itinerary (cascade deletes schedules, activities, and recommendations)
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id);

    return !error;
  }
}
