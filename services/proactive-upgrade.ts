
import React from 'react';
import type { UserLog, Cycle, Sensation } from './api';

export interface UpgradeTrigger {
  id: string; // Unique ID for this trigger type, used for dismissal tracking
  message: string;
  cta: string;
  icon: React.ReactNode;
}

// --- Pattern Detection Logic ---

// 1. Sensation-Mood Correlation
const findSensationMoodCorrelation = (logs: UserLog[]): UpgradeTrigger | null => {
    const sensationMoodPairs: { [s in Sensation]?: { [mood: string]: number } } = {};
    
    logs.forEach(log => {
        if (log.sensations && log.mood) {
            log.sensations.forEach(sensation => {
                if (!sensationMoodPairs[sensation]) sensationMoodPairs[sensation] = {};
                sensationMoodPairs[sensation]![log.mood!] = (sensationMoodPairs[sensation]![log.mood!] || 0) + 1;
            });
        }
    });

    for (const sensation in sensationMoodPairs) {
        for (const mood in sensationMoodPairs[sensation as Sensation]) {
            if (sensationMoodPairs[sensation as Sensation]![mood] >= 3) { // Find a correlation that happened at least 3 times
                return {
                    id: `sensation-mood-${sensation}-${mood}`,
                    message: `We've noticed a possible link between feeling **${mood.toLowerCase()}** and experiencing **${sensation.toLowerCase()}**.`,
                    cta: "Unlock AI Chat to explore this connection.",
                    icon: '🧠',
                };
            }
        }
    }
    return null;
};

// 2. Cycle Irregularity
const findCycleIrregularity = (cycles: Cycle[]): UpgradeTrigger | null => {
    if (cycles.length < 3) return null;

    const cycleLengths = cycles.slice(0, -1).map((cycle, index) => {
        const nextCycle = cycles[index + 1];
        const startDate = new Date(cycle.startDate);
        const nextStartDate = new Date(nextCycle.startDate);
        return Math.ceil(Math.abs(nextStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.map(len => Math.abs(len - avg)).reduce((a, b) => a + b, 0) / cycleLengths.length;
    
    if (variance > 3) { // If average deviation is more than 3 days
        return {
            id: 'cycle-irregularity',
            message: "It looks like your cycle lengths have varied recently. Visualizing your history can help clarify this pattern.",
            cta: "View Full Cycle History",
            icon: '🩸',
        };
    }
    return null;
}

// --- Main Service Function ---

// This function runs all the checks and returns the first one that matches.
export const checkForUpgradeOpportunities = (logs: UserLog[], cycles: Cycle[]): UpgradeTrigger | null => {
    // The order of these checks determines their priority.
    const checks = [
        () => findCycleIrregularity(cycles),
        () => findSensationMoodCorrelation(logs),
        // Add more check functions here in the future
    ];

    for (const check of checks) {
        const result = check();
        if (result) {
            return result;
        }
    }

    return null;
};