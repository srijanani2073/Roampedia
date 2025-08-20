// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Get these values from your Supabase dashboard → Settings → API
const supabaseUrl = 'https://nyykrmqevcvxftcufgti.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eWtybXFldmN2eGZ0Y3VmZ3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDIwMTEsImV4cCI6MjA3MTI3ODAxMX0.jd5OJowd3NQmA-8PXyPi61LiBo3pG00dnpKeGqA3t1M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
