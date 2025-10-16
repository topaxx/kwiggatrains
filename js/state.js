// App state variables
let currentRoutine = [];
let currentRoutineName = "";
let selectedPose = null;
let selectedExercise = null;
let selectedTime = null;
let routines = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
let currentExecutionRoutine = null;
let currentPoseIndex = 0;
let timer = null;
let isPaused = false;
let currentStep = 'name'; // 'name' or 'poses'
let routineToDelete = null;
let routineToRename = null;
let currentTimeLeft = 0; // Track remaining time for pause/resume
let completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
let bellSound = null; // Audio object for bell sound
let bowlSound = null; // Audio object for bowl sound

// Authentication state
let currentUser = null;
let isAuthenticated = false;
let auth0Client = null;

// Supabase configuration
const supabaseUrl = 'https://ujbesovzjszhxdncomdo.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYmVzb3Z6anN6aHhkbmNvbWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzU2NDYsImV4cCI6MjA3NjExMTY0Nn0.fLCooJ6HpBHJiE_JZArNq-1rjmF_8qJFWpItyk1i-eU'; // Replace with your Supabase anon key

// Create client for database operations
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
