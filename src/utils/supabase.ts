import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

// Polyfill for structuredClone in React Native
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

const supabaseUrl = 'https://lltwouolokxpixbqomtj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHdvdW9sb2t4cGl4YnFvbXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzM5NTgsImV4cCI6MjA2ODE0OTk1OH0.k77HMz3840otM6e8p3qwbm4sLAC1K6zR-qX4bd3D9JU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});