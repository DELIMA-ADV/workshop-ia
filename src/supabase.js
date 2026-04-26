import { createClient } from '@supabase/supabase-js';

// A URL do Supabase tinha um erro de digitação na primeira vez que foi fornecida.
// Extraí o ID correto diretamente da sua Anon Key (JWT): nccsdktkkortxrthxxzrh
const supabaseUrl = 'https://nccsdktkkortxrthxxzrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
