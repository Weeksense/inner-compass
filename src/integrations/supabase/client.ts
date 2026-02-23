import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lferxspurybtiznwdipe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZXJ4c3B1cnlidGl6bndkaXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODA1NzcsImV4cCI6MjA4NzQ1NjU3N30.TtO05eCpsrLwIo9piP7swxwrrG14_suATJhSZ-IFo-E';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
