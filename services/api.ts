
import { db, getUserId, supabase } from '../lib/db';
import * as schema from '../db/schema';
import { eq, and, desc } from 'drizzle-orm/sql';
import type { UserSettings } from '../db/schema';

// --- Canonical Data Models & Types ---
export const sensations = ['Headache', 'Hot Flash', 'Brain Fog', 'Fatigue', 'Bloating', 'Irritability'] as const;
export type Sensation = (typeof sensations)[number];


// Re-exporting inferred types from the schema
export type UserProfile = typeof schema.users.$inferSelect;
export type UserLog = typeof schema.logs.$inferSelect;
export type Reflection = typeof schema.reflections.$inferSelect;
export type Milestone = typeof schema.milestones.$inferSelect;
export type Cycle = typeof schema.cycles.$inferSelect;
export type { UserSettings };

export type Tier = UserProfile['tier'];
export type Theme = UserProfile['settings']['theme'];
export type View = 'home' | 'patterns' | 'journal' | 'profile' | 'chat' | 'clinicianSummary' | 'partnerView' | 'trendsView' | 'liveCoach' | 'weeklySummary';
export type PartnerAccess = UserProfile['partnerAccess'];

export interface DailyLog {
  mood?: UserLog['mood'];
  sleep?: number;
  note?: string;
  sensations?: Sensation[];
}

const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getDefaultUserProfile = (id: string, name: string = ''): Omit<UserProfile, 'createdAt'> => ({
    id,
    tier: 'free',
    appState: 'onboarding',
    settings: {
        name,
        theme: 'light',
        remindersEnabled: true,
        reminderTime: '08:00',
        customPrompts: [],
        focusAreas: [],
        onboardingIntent: '',
    },
    partnerAccess: { enabled: false, partnerEmail: null },
    currentStreak: 0,
    lastLogDate: '',
});


// --- API Functions ---

export const fetchUserData = async (): Promise<{ user: UserProfile; logs: UserLog[]; reflections: Reflection[]; milestones: Milestone[]; cycles: Cycle[] }> => {
  const userId = await getUserId();
  
  // Fetch user profile
  let user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  // If user profile doesn't exist, create a default one (for first-time users)
  if (!user) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const newUserProfileData = getDefaultUserProfile(userId, authUser?.user_metadata?.full_name || '');
    const insertedUsers = await db.insert(schema.users).values(newUserProfileData).returning();
    user = insertedUsers[0];
  }
  
  // Fetch all other data related to the user
  const [logs, reflections, milestones, cycles] = await Promise.all([
    db.query.logs.findMany({ where: eq(schema.logs.userId, userId), orderBy: [schema.logs.date] }),
    db.query.reflections.findMany({ where: eq(schema.reflections.userId, userId), orderBy: [desc(schema.reflections.dateGenerated)] }),
    db.query.milestones.findMany({ where: eq(schema.milestones.userId, userId) }),
    db.query.cycles.findMany({ where: eq(schema.cycles.userId, userId), orderBy: [schema.cycles.startDate] }),
  ]);

  return { user, logs, reflections, milestones, cycles };
};

export const saveLog = async (logToSave: DailyLog): Promise<{logs: UserLog[], user: UserProfile}> => {
    const userId = await getUserId();
    const today = new Date();
    const todayStr = getDateString(today);
    
    // Upsert log entry for today
    const existingLog = await db.query.logs.findFirst({
        where: and(eq(schema.logs.userId, userId), eq(schema.logs.date, todayStr))
    });

    if (existingLog) {
        await db.update(schema.logs)
          .set({ ...logToSave, updatedAt: new Date() })
          .where(eq(schema.logs.id, existingLog.id));
    } else {
        await db.insert(schema.logs).values({
            userId,
            date: todayStr,
            ...logToSave,
        });
    }

    // Update streak logic
    const userProfile = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!userProfile) throw new Error("User profile not found.");

    let { currentStreak, lastLogDate } = userProfile;
    if (lastLogDate !== todayStr) {
        const yesterday = getDateString(new Date(Date.now() - 86400000));
        currentStreak = (lastLogDate === yesterday) ? currentStreak + 1 : 1;
        lastLogDate = todayStr;
        
        await db.update(schema.users)
          .set({ currentStreak, lastLogDate })
          .where(eq(schema.users.id, userId));
    }
    
    const [updatedLogs, updatedUser] = await Promise.all([
        db.query.logs.findMany({ where: eq(schema.logs.userId, userId), orderBy: [schema.logs.date] }),
        db.query.users.findFirst({ where: eq(schema.users.id, userId) })
    ]);

    return { logs: updatedLogs, user: updatedUser! };
}

export const updateUserProfile = async (updates: Partial<Omit<UserProfile, 'settings' | 'partnerAccess' | 'id' | 'createdAt'>> & { settings?: Partial<UserSettings>, partnerAccess?: Partial<PartnerAccess> }): Promise<UserProfile> => {
    const userId = await getUserId();
    const currentUser = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!currentUser) throw new Error("User not found");

    const { settings, partnerAccess, ...topLevelUpdates } = updates;

    const finalUpdate: Partial<UserProfile> = {
        ...topLevelUpdates,
        settings: { ...currentUser.settings, ...settings },
        partnerAccess: { ...currentUser.partnerAccess, ...partnerAccess },
    };

    const [updatedUser] = await db.update(schema.users).set(finalUpdate).where(eq(schema.users.id, userId)).returning();
    return updatedUser;
}

export const saveReflections = async (reflections: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'feedback' | 'dateGenerated'>[]): Promise<Reflection[]> => {
    const userId = await getUserId();
    // For simplicity, we'll clear old reflections and insert new ones.
    // In a real app, you might want more sophisticated logic.
    await db.delete(schema.reflections).where(eq(schema.reflections.userId, userId));
    
    if (reflections.length > 0) {
        const todayStr = getDateString(new Date());
        const reflectionsToInsert = reflections.map(r => ({ ...r, userId, dateGenerated: todayStr }));
        await db.insert(schema.reflections).values(reflectionsToInsert);
    }
    
    return db.query.reflections.findMany({ where: eq(schema.reflections.userId, userId), orderBy: [desc(schema.reflections.dateGenerated)] });
};

export const saveReflectionFeedback = async (reflectionId: string, feedback: 'helpful' | 'not_helpful'): Promise<Reflection[]> => {
    const userId = await getUserId();
    await db.update(schema.reflections)
        .set({ feedback })
        .where(and(eq(schema.reflections.id, reflectionId), eq(schema.reflections.userId, userId)));
    
    return db.query.reflections.findMany({ where: eq(schema.reflections.userId, userId), orderBy: [desc(schema.reflections.dateGenerated)] });
}

export const addMilestone = async (milestone: Omit<Milestone, 'id' | 'userId' | 'celebrated' | 'createdAt'>): Promise<Milestone[]> => {
    const userId = await getUserId();
    await db.insert(schema.milestones).values({ ...milestone, userId, celebrated: false });
    return db.query.milestones.findMany({ where: eq(schema.milestones.userId, userId) });
};

export const markMilestoneAsCelebrated = async (milestoneId: string): Promise<Milestone[]> => {
    const userId = await getUserId();
    await db.update(schema.milestones)
        .set({ celebrated: true })
        .where(and(eq(schema.milestones.id, milestoneId), eq(schema.milestones.userId, userId)));
        
    return db.query.milestones.findMany({ where: eq(schema.milestones.userId, userId) });
};

export const logPeriodDay = async (date: string): Promise<Cycle[]> => {
    const userId = await getUserId();
    const latestCycle = await db.query.cycles.findFirst({
        where: eq(schema.cycles.userId, userId),
        orderBy: [desc(schema.cycles.startDate)]
    });

    const twentyDaysAfterLastStart = latestCycle ? new Date(latestCycle.startDate) : null;
    if (twentyDaysAfterLastStart) twentyDaysAfterLastStart.setDate(twentyDaysAfterLastStart.getDate() + 20);

    if (!latestCycle || (twentyDaysAfterLastStart && new Date(date) > twentyDaysAfterLastStart)) {
        await db.insert(schema.cycles).values({ userId, startDate: date, periodDays: [date] });
    } else {
        const newPeriodDays = [...new Set([...latestCycle.periodDays, date])].sort();
        await db.update(schema.cycles)
            .set({ periodDays: newPeriodDays })
            .where(eq(schema.cycles.id, latestCycle.id));
    }
    
    return db.query.cycles.findMany({ where: eq(schema.cycles.userId, userId), orderBy: [schema.cycles.startDate] });
};

export const removePeriodDay = async (date: string): Promise<Cycle[]> => {
    const userId = await getUserId();
    const cycles = await db.query.cycles.findMany({
        where: eq(schema.cycles.userId, userId),
        orderBy: [desc(schema.cycles.startDate)]
    });
    
    const cycleToUpdate = cycles.find(c => c.periodDays.includes(date));

    if (cycleToUpdate) {
        const newPeriodDays = cycleToUpdate.periodDays.filter(d => d !== date);
        await db.update(schema.cycles)
            .set({ periodDays: newPeriodDays })
            .where(eq(schema.cycles.id, cycleToUpdate.id));
    }

    return db.query.cycles.findMany({ where: eq(schema.cycles.userId, userId), orderBy: [schema.cycles.startDate] });
};


export const resetAllData = async (): Promise<{ user: UserProfile }> => {
    const userId = await getUserId();
    // Delete all user-related data, but keep the user profile itself
    await Promise.all([
        db.delete(schema.logs).where(eq(schema.logs.userId, userId)),
        db.delete(schema.reflections).where(eq(schema.reflections.userId, userId)),
        db.delete(schema.milestones).where(eq(schema.milestones.userId, userId)),
        db.delete(schema.cycles).where(eq(schema.cycles.userId, userId)),
    ]);
    
    // Reset the user profile to its default state
    const defaultProfile = getDefaultUserProfile(userId, (await supabase.auth.getUser()).data.user?.user_metadata?.full_name);
    const [updatedUser] = await db.update(schema.users).set(defaultProfile).where(eq(schema.users.id, userId)).returning();
    
    return { user: updatedUser };
};

export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};
