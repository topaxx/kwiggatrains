// Database Functions (Supabase Integration)

async function logTrainingToDatabase(trainData, detailedExercises = []) {
    if (!currentUser) {
        console.log('No user logged in, skipping database log');
        return;
    }

    try {
        console.log('Logging to database with data:', {
            trainName: trainData.trainName,
            totalTime: trainData.totalTime,
            totalReps: trainData.totalReps,
            poseCount: trainData.poseCount,
            hasTimeItems: trainData.hasTimeItems,
            hasRepsItems: trainData.hasRepsItems,
            exercisesCount: detailedExercises.length
        });
        
        const { data, error } = await supabase
            .from('trains')
            .insert([
                {
                    user_id: currentUser.sub,
                    user_name: currentUser.name || currentUser.nickname || 'Unknown',
                    user_email: currentUser.email || '',
                    train_name: trainData.trainName || 'Unnamed Train',
                    duration: trainData.totalTime || trainData.duration,
                    total_reps: trainData.totalReps || 0,
                    pose_count: trainData.poseCount || 0,
                    has_time_items: trainData.hasTimeItems || false,
                    has_reps_items: trainData.hasRepsItems || false,
                    exercises: JSON.stringify(detailedExercises),
                    completed_at: trainData.completedAt || new Date().toISOString()
                }
            ]);
            // Removed .select() to avoid RLS issues with reading inserted data

        if (error) {
            console.error('❌ Error logging training to database:', error);
            return null;
        } else {
            console.log('✅ Training logged to database successfully');
            return { success: true, inserted: true };
        }
    } catch (error) {
        console.error('❌ Database error:', error);
        return null;
    }
}

async function getUserTrainings() {
    console.log('🔍 Querying Supabase for user:', currentUser?.sub);
    
    if (!currentUser) {
        console.warn('⚠️ No user logged in, cannot fetch trainings');
        return [];
    }

    try {
        // Since we're using Auth0, not Supabase Auth, we need to bypass RLS
        // by using a direct query with the user_id filter
        console.log('🔍 Fetching user training records...');
        
        const { data, error } = await supabase
            .from('trains')
            .select('*')
            .eq('user_id', currentUser.sub)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching trainings:', error);
            console.error('❌ Error details:', error.message, error.details, error.hint);
            return [];
        }

        console.log('✅ Found trainings:', data?.length || 0, 'records');
        return data || [];
        
    } catch (error) {
        console.error('❌ Database connection error:', error);
        return [];
    }
}

function subscribeToTrainings() {
    if (!currentUser) return;

    const subscription = supabase
        .channel('trains_changes')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'trains',
                filter: `user_id=eq.${currentUser.sub}`
            }, 
            (payload) => {
                console.log('New training logged:', payload.new);
                // Here you can update the UI if needed
            }
        )
        .subscribe();

    return subscription;
}
