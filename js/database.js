// Database Functions (Supabase Integration)

async function logTrainingToDatabase(routineData) {
    if (!currentUser) {
        console.log('No user logged in, skipping database log');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('trains')
            .insert([
                {
                    user_id: currentUser.sub,
                    user_name: currentUser.name || currentUser.nickname || 'Unknown',
                    user_email: currentUser.email || '',
                    routine_name: routineData.routineName,
                    duration: routineData.totalTime || routineData.duration,
                    exercises: JSON.stringify(routineData.poses || routineData.exercises),
                    completed_at: routineData.completedAt || new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Error logging training to database:', error);
        } else {
            console.log('Training logged to database:', data);
        }
    } catch (error) {
        console.error('Database error:', error);
    }
}

async function getUserTrainings() {
    if (!currentUser) {
        console.log('No user logged in, cannot fetch trainings');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('trains')
            .select('*')
            .eq('user_id', currentUser.sub)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Error fetching user trainings:', error);
            return [];
        }

        console.log('Fetched user trainings:', data);
        return data || [];
    } catch (error) {
        console.error('Database error:', error);
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
