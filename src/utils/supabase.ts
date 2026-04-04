import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are valid placeholders or actual values
const isValidConfig = supabaseUrl && supabaseUrl !== 'your-project-url' && supabaseKey && supabaseKey !== 'your-anon-key';

export const supabase = isValidConfig ? createClient(supabaseUrl, supabaseKey) : null;

export const saveScore = async (username: string, streak: number) => {
  if (!supabase) {
    console.warn('Supabase not configured. Score will be saved locally only.');
    throw new Error('Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert([{ username, streak }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving score to database:', error);
    throw error;
  }
};

export const getTopScores = async () => {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('streak', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching scores from database:', error);
    return [];
  }
};