import { supabase } from './supabase';
export async function getCookingStreak(userId) {
    const { data, error } = await supabase
        .from('user_activities')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
    if (error || !data || data.length === 0)
        return 0;
    const dates = [...new Set(data.map(d => d.completed_at))].map(d => new Date(d));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    // Check if today was recorded
    const today = dates.find(d => d.getTime() === currentDate.getTime());
    if (!today) {
        // Check if yesterday was recorded (streak could still be alive)
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterday = dates.find(d => d.getTime() === currentDate.getTime());
        if (!yesterday)
            return 0;
    }
    // Count backwards
    for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        checkDate.setDate(checkDate.getDate() - (today ? i : i + 1));
        if (dates.find(d => d.getTime() === checkDate.getTime())) {
            streak++;
        }
        else {
            break;
        }
    }
    return streak;
}
export async function recordActivity(userId, type) {
    const { error } = await supabase.from('user_activities').upsert({
        user_id: userId,
        activity_type: type,
        completed_at: new Date().toISOString().split('T')[0]
    });
    return !error;
}
