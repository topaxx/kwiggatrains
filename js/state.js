// App state variables
let currentTrain = [];
let currentTrainName = "";
let selectedPose = null;
let selectedExercise = null;
let selectedTime = null;
let trains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
let trainGroups = JSON.parse(localStorage.getItem('kwiggaTrainGroups') || '[]');
let currentExecutionTrain = null;
let currentPoseIndex = 0;
let timer = null;
let isPaused = false;
let currentStep = 'name'; // 'name' or 'poses'
let trainToDelete = null;
let trainToRename = null;
let currentTimeLeft = 0; // Track remaining time for pause/resume
let completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
let dailyActivities = JSON.parse(localStorage.getItem('kwiggaDailyActivities') || '[]'); // List of train IDs for daily activities
let dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}'); // Track completions by date { "YYYY-MM-DD": [trainId1, trainId2, ...] }
let previousScreenBeforeExecution = null; // Track which screen was active before starting train execution
let bellSound = null; // Audio object for bell sound
let bowlSound = null; // Audio object for bowl sound
let completionSound = null; // Audio object for completion sound
// Get sound preferences from localStorage or use defaults
let selectedCompletionSound = localStorage.getItem('completionSound') || 'bowlsound'; // Default to bowlsound
let selectedBellSound = localStorage.getItem('bellSound') || 'bellsound'; // Default to bellsound
// Get start screen preference from localStorage or use default
let selectedStartScreen = localStorage.getItem('startScreen') || 'main'; // Default to main (list of trains)

// Save defaults to localStorage if they don't exist (first time user)
if (!localStorage.getItem('completionSound')) {
    localStorage.setItem('completionSound', selectedCompletionSound);
}
if (!localStorage.getItem('bellSound')) {
    localStorage.setItem('bellSound', selectedBellSound);
}
if (!localStorage.getItem('startScreen')) {
    localStorage.setItem('startScreen', selectedStartScreen);
}

// Authentication state
let currentUser = null;
let isAuthenticated = false;
let auth0Client = null;

// Supabase configuration
const supabaseUrl = 'https://ujbesovzjszhxdncomdo.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYmVzb3Z6anN6aHhkbmNvbWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzU2NDYsImV4cCI6MjA3NjExMTY0Nn0.fLCooJ6HpBHJiE_JZArNq-1rjmF_8qJFWpItyk1i-eU'; // Replace with your Supabase anon key

// Create client for database operations
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
