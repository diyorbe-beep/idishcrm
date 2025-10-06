import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gvxgusfuwozjifhcqffr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eGd1c2Z1d296amlmaGNxZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTcwNzEsImV4cCI6MjA3NTMzMzA3MX0.V_OMI8nXzB4_YQjtgssJH5tH9EM5d2pVTGsn89lTL9M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
